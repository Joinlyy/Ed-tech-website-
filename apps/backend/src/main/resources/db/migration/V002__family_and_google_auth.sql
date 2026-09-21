-- V002 — family accounts, Google auth on parent users, payment orders.
-- Compatible with PostgreSQL 16 and H2 (MODE=PostgreSQL).
--
-- Model:
--   family        = one paying household. Owns a plan and one or more students.
--   users(PARENT) = the payer. Authenticates via Google (no password).
--   users(STUDENT)= the child. Authenticates via email + password set by the parent.
--   payment_orders = one row per checkout attempt, resolved by webhook / confirm.

-- ── users: add Google-sub + family link, allow null password (Google users) ──
ALTER TABLE users ADD COLUMN google_sub    VARCHAR(64)  NULL;
ALTER TABLE users ADD COLUMN family_id     VARCHAR(36)  NULL;

-- Unique when present (Postgres partial index; H2 tolerates unique on nullable).
CREATE UNIQUE INDEX ux_users_google_sub ON users (google_sub);
CREATE INDEX        ix_users_family_id  ON users (family_id);

-- Old CHECK constraint enforced role IN ('CLIENT','STAFF','ADMIN'). Broaden it.
ALTER TABLE users DROP CONSTRAINT chk_users_role;
ALTER TABLE users ADD  CONSTRAINT chk_users_role
    CHECK (role IN ('CLIENT','PARENT','STUDENT','STAFF','ADMIN'));

-- Password hash is now optional (Google-auth parents don't have one).
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- ── families ────────────────────────────────────────────────────────────────
CREATE TABLE families (
    id             VARCHAR(36)  PRIMARY KEY,
    parent_user_id VARCHAR(36)  NOT NULL,
    plan_code      VARCHAR(40)  NOT NULL,
    paid_at        TIMESTAMP    NULL,
    valid_until    TIMESTAMP    NULL,
    created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_families_parent FOREIGN KEY (parent_user_id) REFERENCES users(id),
    CONSTRAINT uq_families_parent UNIQUE (parent_user_id)
);

-- ── payment_orders ──────────────────────────────────────────────────────────
CREATE TABLE payment_orders (
    id                   VARCHAR(36)  PRIMARY KEY,
    parent_user_id       VARCHAR(36)  NOT NULL,
    family_id            VARCHAR(36)  NULL,
    plan_code            VARCHAR(40)  NOT NULL,
    amount_paise         BIGINT       NOT NULL,
    currency             VARCHAR(8)   NOT NULL DEFAULT 'INR',
    status               VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    provider             VARCHAR(20)  NOT NULL DEFAULT 'STUB',
    provider_order_id    VARCHAR(128) NULL,
    provider_payment_id  VARCHAR(128) NULL,
    created_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paid_at              TIMESTAMP    NULL,
    CONSTRAINT fk_orders_parent  FOREIGN KEY (parent_user_id) REFERENCES users(id),
    CONSTRAINT fk_orders_family  FOREIGN KEY (family_id)      REFERENCES families(id),
    CONSTRAINT chk_orders_status CHECK (status IN ('PENDING','PAID','CANCELLED','FAILED'))
);

CREATE INDEX ix_orders_parent ON payment_orders (parent_user_id);
CREATE INDEX ix_orders_status ON payment_orders (status);
