import { destroyContainer } from './container-manager';
import { deleteSandboxRecord, findSandbox } from './db';
import { removeSession, getSession } from './session-store';
import { WebSocket } from 'ws';
import { ServerMessage } from './types';

/**
 * Handles the user.deleted lifecycle event.
 *
 * Steps:
 * 1. Close any active WebSocket terminal session for the user
 * 2. Stop + remove the Docker container
 * 3. Delete the bind-mount volume directory
 * 4. Remove the DB record
 */
export async function onUserDeleted(event: { userId: string }): Promise<void> {
  const { userId } = event;
  console.log(`[LifecycleHandler] user.deleted received for userId=${userId}`);

  // Step 1: Terminate active WebSocket session
  const session = getSession(userId);
  if (session) {
    try {
      if (session.socket.readyState === WebSocket.OPEN) {
        const msg: ServerMessage = { type: 'error', message: 'Sandbox terminated: user account deleted' };
        session.socket.send(JSON.stringify(msg));
        session.socket.close(1001, 'User deleted');
      }
    } catch (_) { /* ignore */ }
    removeSession(userId);
  }

  // Step 2+3: Destroy Docker container and volume
  const sandbox = await findSandbox(userId);
  if (sandbox) {
    await destroyContainer(sandbox.containerId, userId);
    console.log(`[LifecycleHandler] Destroyed container and volume for userId=${userId}`);
  }

  // Step 4: Remove DB record
  await deleteSandboxRecord(userId);
  console.log(`[LifecycleHandler] Cleanup complete for userId=${userId}`);
}
