import Dockerode from 'dockerode';
import * as fs from 'fs';
import * as path from 'path';
import { SandboxImage, SandboxProvisionRequest } from './types';

const docker = new Dockerode({ socketPath: '/var/run/docker.sock' });

// Base directory on the host where user volumes are bind-mounted
const SANDBOXES_ROOT = process.env.SANDBOXES_ROOT ?? '/sandboxes';

/**
 * Builds the container creation spec for a user sandbox.
 * - No network access (NetworkMode: none)
 * - 512 MB RAM, 50% CPU
 * - Bind-mounted persistent volume
 * - No privilege escalation
 */
function buildContainerSpec(
  userId: string,
  image: SandboxImage,
  storageQuotaMb: number
): Dockerode.ContainerCreateOptions {
  const volumePath = path.join(SANDBOXES_ROOT, userId);
  return {
    Image: image,
    name: `sandbox-${userId}`,
    Tty: true,
    OpenStdin: true,
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    WorkingDir: '/workspace',
    Cmd: ['/bin/sh'],   // Default shell; node image ships /bin/sh via alpine
    Env: [
      'TERM=xterm-256color',
      `SANDBOX_USER=${userId}`,
    ],
    HostConfig: {
      Binds: [`${volumePath}:/workspace`],
      Memory: 512 * 1024 * 1024,           // 512 MB
      CpuQuota: 50_000,                    // 50% of 1 CPU
      NetworkMode: 'none',                 // no internet
      ReadonlyRootfs: false,
      StorageOpt: { size: `${storageQuotaMb}M` },
      SecurityOpt: ['no-new-privileges:true'],
      CapDrop: ['ALL'],
      RestartPolicy: { Name: 'no' },
    },
  };
}

/**
 * Ensures the host volume directory exists with correct permissions.
 */
function ensureVolumeDir(userId: string): string {
  const volumePath = path.join(SANDBOXES_ROOT, userId);
  if (!fs.existsSync(volumePath)) {
    fs.mkdirSync(volumePath, { recursive: true, mode: 0o700 });
  }
  return volumePath;
}

/**
 * Provisions a brand-new container for a user.
 * Creates the host volume directory, pulls the image if needed,
 * then creates + starts the container.
 */
export async function createContainer(
  req: SandboxProvisionRequest
): Promise<{ containerId: string; containerName: string; volumePath: string }> {
  const image = req.image ?? 'node:20-alpine';
  const storageQuotaMb = req.storageQuotaMb ?? 512;
  const volumePath = ensureVolumeDir(req.userId);

  // Pull image if not present locally
  await pullImageIfMissing(image);

  const spec = buildContainerSpec(req.userId, image, storageQuotaMb);
  const container = await docker.createContainer(spec);
  await container.start();

  const inspected = await container.inspect();
  return {
    containerId: inspected.Id,
    containerName: `sandbox-${req.userId}`,
    volumePath,
  };
}

/**
 * Resumes a stopped/paused container.
 */
export async function resumeContainer(containerId: string): Promise<void> {
  const container = docker.getContainer(containerId);
  const info = await container.inspect();

  if (info.State.Paused) {
    await container.unpause();
  } else if (!info.State.Running) {
    await container.start();
  }
  // Already running — no-op
}

/**
 * Pauses a running container without destroying its volume.
 * Used on WebSocket disconnect after idle timeout.
 */
export async function pauseContainer(containerId: string): Promise<void> {
  try {
    const container = docker.getContainer(containerId);
    const info = await container.inspect();
    if (info.State.Running && !info.State.Paused) {
      await container.pause();
    }
  } catch (err) {
    console.error(`[ContainerManager] Failed to pause ${containerId}:`, err);
  }
}

/**
 * Fully stops, removes the container and deletes its persistent volume.
 * Called when a user is deleted.
 */
export async function destroyContainer(
  containerId: string,
  userId: string
): Promise<void> {
  // Stop container
  try {
    const container = docker.getContainer(containerId);
    await container.stop({ t: 5 });
    await container.remove({ force: true });
  } catch (err: unknown) {
    // Container may already be gone
    const msg = err instanceof Error ? err.message : String(err);
    if (!msg.includes('no such container')) {
      console.error(`[ContainerManager] Failed to remove container ${containerId}:`, msg);
    }
  }

  // Delete volume directory
  const volumePath = path.join(SANDBOXES_ROOT, userId);
  if (fs.existsSync(volumePath)) {
    fs.rmSync(volumePath, { recursive: true, force: true });
    console.log(`[ContainerManager] Deleted volume: ${volumePath}`);
  }
}

/**
 * Opens an exec PTY session inside a running container.
 * Returns a readable/writable exec stream.
 */
export async function execInContainer(
  containerId: string
): Promise<{ exec: Dockerode.Exec; stream: NodeJS.ReadWriteStream }> {
  const container = docker.getContainer(containerId);
  const exec = await container.exec({
    Cmd: ['/bin/sh'],
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
    Env: ['TERM=xterm-256color'],
  });

  const stream = await exec.start({ hijack: true, stdin: true, Tty: true });
  return { exec, stream };
}

/**
 * Resizes the PTY of an active exec instance.
 */
export async function resizeExec(
  exec: Dockerode.Exec,
  cols: number,
  rows: number
): Promise<void> {
  try {
    await exec.resize({ w: cols, h: rows });
  } catch (_) {
    // Non-fatal — exec may have just closed
  }
}

/** Checks if an image exists locally; pulls if not. */
async function pullImageIfMissing(image: string): Promise<void> {
  try {
    await docker.getImage(image).inspect();
  } catch {
    console.log(`[ContainerManager] Pulling image: ${image}`);
    await new Promise<void>((resolve, reject) => {
      docker.pull(image, (err: Error | null, stream: NodeJS.ReadableStream) => {
        if (err) return reject(err);
        docker.modem.followProgress(stream, (pullErr: Error | null) => {
          if (pullErr) reject(pullErr);
          else resolve();
        });
      });
    });
    console.log(`[ContainerManager] Image ready: ${image}`);
  }
}
