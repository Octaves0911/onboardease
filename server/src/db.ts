import { Pool, PoolClient } from 'pg';
import { SandboxContainer, SandboxStatus } from './types';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/onboardease',
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 2_000,
});

export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

/** Find an existing sandbox record for a user */
export async function findSandbox(userId: string): Promise<SandboxContainer | null> {
  const { rows } = await pool.query<SandboxContainer>(
    `SELECT
       id, user_id AS "userId", company_id AS "companyId",
       container_id AS "containerId", container_name AS "containerName",
       status, volume_path AS "volumePath", port, image,
       storage_quota_mb AS "storageQuotaMb",
       created_at AS "createdAt", last_active_at AS "lastActiveAt"
     FROM sandbox_containers
     WHERE user_id = $1
     LIMIT 1`,
    [userId]
  );
  return rows[0] ?? null;
}

/** Insert a new sandbox record */
export async function createSandboxRecord(
  data: Omit<SandboxContainer, 'id' | 'createdAt' | 'lastActiveAt'>
): Promise<SandboxContainer> {
  const { rows } = await pool.query<SandboxContainer>(
    `INSERT INTO sandbox_containers
       (user_id, company_id, container_id, container_name, status,
        volume_path, port, image, storage_quota_mb)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING
       id, user_id AS "userId", company_id AS "companyId",
       container_id AS "containerId", container_name AS "containerName",
       status, volume_path AS "volumePath", port, image,
       storage_quota_mb AS "storageQuotaMb",
       created_at AS "createdAt", last_active_at AS "lastActiveAt"`,
    [
      data.userId, data.companyId, data.containerId, data.containerName,
      data.status, data.volumePath, data.port, data.image, data.storageQuotaMb,
    ]
  );
  return rows[0];
}

/** Update sandbox status and last_active_at */
export async function updateSandboxStatus(
  userId: string,
  status: SandboxStatus
): Promise<void> {
  await pool.query(
    `UPDATE sandbox_containers
     SET status = $1, last_active_at = NOW()
     WHERE user_id = $2`,
    [status, userId]
  );
}

/** Delete a sandbox record (called on user.deleted) */
export async function deleteSandboxRecord(userId: string): Promise<void> {
  await pool.query(
    'DELETE FROM sandbox_containers WHERE user_id = $1',
    [userId]
  );
}

/** Fetch all sandboxes with a given status (for idle cleanup jobs) */
export async function listSandboxesByStatus(
  status: SandboxStatus
): Promise<SandboxContainer[]> {
  const { rows } = await pool.query<SandboxContainer>(
    `SELECT
       id, user_id AS "userId", company_id AS "companyId",
       container_id AS "containerId", container_name AS "containerName",
       status, volume_path AS "volumePath", port, image,
       storage_quota_mb AS "storageQuotaMb",
       created_at AS "createdAt", last_active_at AS "lastActiveAt"
     FROM sandbox_containers
     WHERE status = $1`,
    [status]
  );
  return rows;
}
