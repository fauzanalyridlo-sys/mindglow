CREATE TABLE IF NOT EXISTS academic_tasks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    course VARCHAR(255) NOT NULL,
    deadline DATE NOT NULL,
    priority VARCHAR(10) NOT NULL,
    type VARCHAR(10) NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT academic_tasks_user_id_foreign
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT academic_tasks_priority_check
        CHECK (priority IN ('Rendah', 'Sedang', 'Tinggi')),

    CONSTRAINT academic_tasks_type_check
        CHECK (type IN ('Kelompok', 'Individu'))
);

CREATE INDEX IF NOT EXISTS academic_tasks_user_id_idx
    ON academic_tasks(user_id);

CREATE INDEX IF NOT EXISTS academic_tasks_user_deadline_idx
    ON academic_tasks(user_id, deadline);

CREATE INDEX IF NOT EXISTS academic_tasks_user_completed_idx
    ON academic_tasks(user_id, completed);
