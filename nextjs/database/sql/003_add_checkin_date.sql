ALTER TABLE daily_check_ins
ADD COLUMN IF NOT EXISTS checkin_date DATE;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'daily_check_ins_user_date_unique'
          AND conrelid = 'daily_check_ins'::regclass
    ) THEN
        ALTER TABLE daily_check_ins
        ADD CONSTRAINT daily_check_ins_user_date_unique
        UNIQUE (user_id, checkin_date);
    END IF;
END
$$;
