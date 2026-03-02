-- Migration: create sandbox_containers table
-- Run once against the onboardease PostgreSQL database.

CREATE TABLE IF NOT EXISTS sandbox_containers (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          TEXT        NOT NULL,
  company_id       TEXT        NOT NULL DEFAULT 'default',
  container_id     VARCHAR(255) NOT NULL UNIQUE,   -- Docker container ID (64-char hex)
  container_name   VARCHAR(255) NOT NULL UNIQUE,   -- sandbox-{userId}
  status           VARCHAR(50) NOT NULL DEFAULT 'running',
    -- running | paused | stopped | error
  volume_path      VARCHAR(500) NOT NULL,           -- /sandboxes/{userId}
  port             INTEGER     NOT NULL DEFAULT 0,  -- reserved for future per-container ports
  image            VARCHAR(100) NOT NULL DEFAULT 'node:20-alpine',
  storage_quota_mb INTEGER     NOT NULL DEFAULT 512,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sandbox_user_id ON sandbox_containers(user_id);
CREATE INDEX IF NOT EXISTS idx_sandbox_status  ON sandbox_containers(status);

COMMENT ON TABLE  sandbox_containers IS 'One record per user: tracks their isolated Docker sandbox container and persistent bind-mount volume.';
COMMENT ON COLUMN sandbox_containers.container_id    IS 'Full Docker container ID returned by docker create';
COMMENT ON COLUMN sandbox_containers.volume_path     IS 'Host path bind-mounted at /workspace inside the container';
COMMENT ON COLUMN sandbox_containers.storage_quota_mb IS 'Disk quota for the container (enforced via Docker StorageOpt)';
