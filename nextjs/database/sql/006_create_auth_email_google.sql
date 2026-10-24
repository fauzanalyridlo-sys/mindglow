BEGIN;

-- Token verifikasi email.
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP(0) NOT NULL,
    created_at TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT email_verification_tokens_user_id_foreign
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS email_verification_tokens_user_id_idx
    ON email_verification_tokens(user_id);

CREATE INDEX IF NOT EXISTS email_verification_tokens_expires_at_idx
    ON email_verification_tokens(expires_at);

-- Akun OAuth yang terhubung dengan pengguna MindGlow.
CREATE TABLE IF NOT EXISTS oauth_accounts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    provider VARCHAR(50) NOT NULL,
    provider_account_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT oauth_accounts_user_id_foreign
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT oauth_accounts_provider_account_unique
        UNIQUE (provider, provider_account_id),

    CONSTRAINT oauth_accounts_user_provider_unique
        UNIQUE (user_id, provider)
);

CREATE INDEX IF NOT EXISTS oauth_accounts_user_id_idx
    ON oauth_accounts(user_id);

-- Akun Google tidak wajib memiliki password lokal.
ALTER TABLE users
    ALTER COLUMN password DROP NOT NULL;

-- Izin akses untuk role aplikasi.
GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE email_verification_tokens, oauth_accounts
TO mindglow;

GRANT USAGE, SELECT
ON SEQUENCE email_verification_tokens_id_seq,
            oauth_accounts_id_seq
TO mindglow;

COMMIT;
