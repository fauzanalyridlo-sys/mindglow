CREATE TABLE IF NOT EXISTS ai_rate_limits (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    window_type VARCHAR(10) NOT NULL,
    window_start TIMESTAMPTZ NOT NULL,
    request_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ai_rate_limits_window_type_check
        CHECK (window_type IN ('hour', 'day')),

    CONSTRAINT ai_rate_limits_request_count_check
        CHECK (request_count >= 0),

    CONSTRAINT ai_rate_limits_unique_window
        UNIQUE (user_id, window_type, window_start)
);

CREATE INDEX IF NOT EXISTS ai_rate_limits_window_start_idx
ON ai_rate_limits (window_start);

-- Berikan akses kepada role aplikasi MindGlow.
-- Diperlukan jika migration dijalankan oleh role administrator.
GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE ai_rate_limits
TO mindglow;

GRANT USAGE, SELECT
ON SEQUENCE ai_rate_limits_id_seq
TO mindglow;
