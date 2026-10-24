BEGIN;

CREATE TABLE IF NOT EXISTS auth_rate_limits (
    rate_key VARCHAR(64) PRIMARY KEY,
    window_start TIMESTAMPTZ NOT NULL,
    request_count INTEGER NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT auth_rate_limits_request_count_check
        CHECK (request_count >= 0)
);

CREATE INDEX IF NOT EXISTS auth_rate_limits_window_start_idx
    ON auth_rate_limits (window_start);

COMMIT;
