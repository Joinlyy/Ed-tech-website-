-- V001 — initial schema (users, papers)
-- Compatible with both PostgreSQL 16 and H2 (MODE=PostgreSQL).

CREATE TABLE users (
    id             VARCHAR(36)  PRIMARY KEY,
    email          VARCHAR(255) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    full_name      VARCHAR(255) NOT NULL,
    role           VARCHAR(20)  NOT NULL,
    created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_users_role CHECK (role IN ('CLIENT', 'STAFF', 'ADMIN'))
);

CREATE INDEX idx_users_email ON users (email);

CREATE TABLE papers (
    id              VARCHAR(36)  PRIMARY KEY,
    student_id      VARCHAR(36)  NOT NULL,
    board_class     VARCHAR(20)  NOT NULL,
    subject         VARCHAR(40)  NOT NULL,
    paper_number    INT          NOT NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'DRAFT',
    uploaded_at     TIMESTAMP    NULL,
    marked_at       TIMESTAMP    NULL,
    total_marks     INT          NULL,
    awarded_marks   INT          NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_papers_student FOREIGN KEY (student_id) REFERENCES users(id),
    CONSTRAINT chk_papers_status CHECK (status IN ('DRAFT','UPLOADED','IN_REVIEW','MARKED','DELIVERED')),
    CONSTRAINT chk_papers_class  CHECK (board_class IN ('CBSE_10','CBSE_12'))
);

CREATE INDEX idx_papers_student ON papers (student_id);
CREATE INDEX idx_papers_status  ON papers (status);
