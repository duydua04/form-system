-- Kích hoạt extension nếu cần
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE form_status_enum AS ENUM ('active', 'draft');
CREATE TYPE field_type_enum AS ENUM ('text', 'number', 'date', 'color', 'select', 'file');

CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_admins_email ON admins(email);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);

CREATE TABLE forms (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0 NOT NULL,
    status form_status_enum DEFAULT 'draft' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_forms_admin FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE CASCADE
);
CREATE INDEX idx_forms_admin_id ON forms(admin_id);

CREATE TABLE fields (
    id SERIAL PRIMARY KEY,
    form_id INTEGER NOT NULL,
    label VARCHAR(255) NOT NULL,
    field_type field_type_enum NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL,
    is_required BOOLEAN DEFAULT FALSE NOT NULL,
    options JSONB,
    CONSTRAINT fk_fields_form FOREIGN KEY (form_id) REFERENCES forms (id) ON DELETE CASCADE,
    CONSTRAINT check_options_logic CHECK (
        (field_type = 'select' AND options IS NOT NULL) OR
        (field_type != 'select' AND options IS NULL)
    )
);
CREATE INDEX idx_fields_form_id ON fields(form_id);

CREATE TABLE form_submissions (
    id SERIAL PRIMARY KEY,
    form_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_submissions_form FOREIGN KEY (form_id) REFERENCES forms (id) ON DELETE CASCADE,
    CONSTRAINT fk_submissions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
CREATE INDEX idx_submissions_form_id ON form_submissions(form_id);
CREATE INDEX idx_submissions_user_id ON form_submissions(user_id);

CREATE TABLE submission_answers (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER NOT NULL,
    field_id INTEGER NOT NULL,
    value TEXT,
    CONSTRAINT fk_answers_submission FOREIGN KEY (submission_id) REFERENCES form_submissions (id) ON DELETE CASCADE,
    CONSTRAINT fk_answers_field FOREIGN KEY (field_id) REFERENCES fields (id) ON DELETE CASCADE
);
CREATE INDEX idx_answers_submission_id ON submission_answers(submission_id);
CREATE INDEX idx_answers_field_id ON submission_answers(field_id);