BEGIN;

CREATE TABLE IF NOT EXISTS public.mindglow_sessions (
    id UUID PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP(0) NOT NULL,
    created_at TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT mindglow_sessions_user_id_foreign
        FOREIGN KEY (user_id)
        REFERENCES public.users(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS mindglow_sessions_user_id_idx
    ON public.mindglow_sessions(user_id);

CREATE INDEX IF NOT EXISTS mindglow_sessions_expires_at_idx
    ON public.mindglow_sessions(expires_at);

COMMIT;
