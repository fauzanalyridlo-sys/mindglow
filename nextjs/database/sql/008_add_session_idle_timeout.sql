BEGIN;

ALTER TABLE public.mindglow_sessions
    ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP(0);

UPDATE public.mindglow_sessions
SET last_activity_at = created_at
WHERE last_activity_at IS NULL;

ALTER TABLE public.mindglow_sessions
    ALTER COLUMN last_activity_at SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE public.mindglow_sessions
    ALTER COLUMN last_activity_at SET NOT NULL;

COMMIT;
