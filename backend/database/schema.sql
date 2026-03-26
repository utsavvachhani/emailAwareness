-- ─── REFRESH TRIGGER LOGIC (Run first to ensure NEW.updated_at works) ───────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ─── CRITICAL COLUMN GUARDS ──────────────────────────────────────────────────
-- (Ensure these columns exist before triggers try to use them)
ALTER TABLE users        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE admins       ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE superadmins  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE companies    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE employees    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE courses      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE profiles     ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ─── NORMAL USERS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    mobile        VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'user',
    is_verified   BOOLEAN      NOT NULL DEFAULT FALSE,
    status        VARCHAR(20)  NOT NULL DEFAULT 'active',
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login    TIMESTAMP
);

-- ─── ADMINS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
    id            SERIAL PRIMARY KEY,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    mobile        VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'admin',
    is_verified   BOOLEAN      NOT NULL DEFAULT FALSE,
    status        VARCHAR(20)  NOT NULL DEFAULT 'pending',
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login    TIMESTAMP
);

-- ─── SUPERADMINS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS superadmins (
    id            SERIAL PRIMARY KEY,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    mobile        VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'superadmin',
    is_verified   BOOLEAN      NOT NULL DEFAULT TRUE,
    status        VARCHAR(20)  NOT NULL DEFAULT 'active',
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login    TIMESTAMP
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email        ON users(email);
CREATE INDEX IF NOT EXISTS idx_admins_email       ON admins(email);
CREATE INDEX IF NOT EXISTS idx_superadmins_email  ON superadmins(email);

-- ─── PROFILES ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
    id           SERIAL  PRIMARY KEY,
    user_id      INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    admin_id     INTEGER UNIQUE REFERENCES admins(id) ON DELETE CASCADE,
    superadmin_id INTEGER UNIQUE REFERENCES superadmins(id) ON DELETE CASCADE,
    photo        TEXT,
    bio          TEXT,
    designation  VARCHAR(255),
    organization VARCHAR(255) DEFAULT 'CyberShield Guard',
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_only_one_owner CHECK (
        (user_id IS NOT NULL)::int + (admin_id IS NOT NULL)::int + (superadmin_id IS NOT NULL)::int = 1
    )
);

-- ─── OTPs ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS otps (
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER REFERENCES users(id) ON DELETE CASCADE,
    admin_id      INTEGER REFERENCES admins(id) ON DELETE CASCADE,
    superadmin_id INTEGER REFERENCES superadmins(id) ON DELETE CASCADE,
    otp           VARCHAR(10) NOT NULL,
    expires_at    TIMESTAMP   NOT NULL,
    is_used       BOOLEAN     NOT NULL DEFAULT FALSE,
    verified_at   TIMESTAMP,
    created_at    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_otp_owner CHECK (
        (user_id IS NOT NULL)::int + (admin_id IS NOT NULL)::int + (superadmin_id IS NOT NULL)::int = 1
    )
);

-- ─── REFRESH TOKENS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER REFERENCES users(id) ON DELETE CASCADE,
    admin_id      INTEGER REFERENCES admins(id) ON DELETE CASCADE,
    superadmin_id INTEGER REFERENCES superadmins(id) ON DELETE CASCADE,
    token         TEXT    NOT NULL,
    expires_at    TIMESTAMP NOT NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_token_owner CHECK (
        (user_id IS NOT NULL)::int + (admin_id IS NOT NULL)::int + (superadmin_id IS NOT NULL)::int = 1
    )
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);

-- ─── LOGIN AUDIT ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS login_audit (
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER,
    admin_id      INTEGER,
    superadmin_id INTEGER,
    email         VARCHAR(255) NOT NULL,
    role          VARCHAR(20),
    ip_address    VARCHAR(50),
    user_agent    TEXT,
    logged_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─── TRIGGERS ────────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS update_users_updated_at    ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admins_updated_at   ON admins;
CREATE TRIGGER update_admins_updated_at
    BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_superadmins_updated_at ON superadmins;
CREATE TRIGGER update_superadmins_updated_at
    BEFORE UPDATE ON superadmins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── COMPANIES ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
    id                SERIAL PRIMARY KEY,
    company_id        VARCHAR(50) UNIQUE NOT NULL,
    name              VARCHAR(255) NOT NULL,
    email             VARCHAR(255) NOT NULL,
    phone             VARCHAR(30),
    admin_id          INTEGER REFERENCES admins(id) ON DELETE SET NULL,
    industry          VARCHAR(100),
    website           VARCHAR(255),
    address           TEXT,
    notes             TEXT,
    status            VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_companies_admin_id ON companies(admin_id);

DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── EMPLOYEES ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS employees (
    id                SERIAL PRIMARY KEY,
    first_name        VARCHAR(100) NOT NULL,
    last_name         VARCHAR(100) NOT NULL,
    email             VARCHAR(255) NOT NULL,
    company_id        INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    designation       VARCHAR(100),
    status            VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_employees_company_id ON employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);

DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── COURSES ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
    id               SERIAL PRIMARY KEY,
    title            VARCHAR(255) NOT NULL,
    description      TEXT,
    total_duration   VARCHAR(50),
    difficulty       VARCHAR(20) NOT NULL DEFAULT 'medium',
    status           VARCHAR(20) NOT NULL DEFAULT 'pending',
    admin_id         INTEGER REFERENCES admins(id) ON DELETE SET NULL,
    company_id       INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    rejection_reason TEXT,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Extra guards for missing courses columns
ALTER TABLE courses ADD COLUMN IF NOT EXISTS status           VARCHAR(20) NOT NULL DEFAULT 'pending';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS difficulty       VARCHAR(20) NOT NULL DEFAULT 'medium';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS admin_id         INTEGER REFERENCES admins(id) ON DELETE SET NULL;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS company_id       INTEGER REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS total_duration   VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_courses_company_id ON courses(company_id);
CREATE INDEX IF NOT EXISTS idx_courses_status     ON courses(status);

DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── COURSE MODULES ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS course_modules (
    id            SERIAL PRIMARY KEY,
    course_id     INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title         VARCHAR(255) NOT NULL,
    type          VARCHAR(20) NOT NULL DEFAULT 'docs',
    content       TEXT,

    video_url     TEXT,
    image_url     TEXT,
    duration      VARCHAR(50),
    status        VARCHAR(20) NOT NULL DEFAULT 'published',


    order_index   INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_modules_course_id ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_modules_status    ON course_modules(status);

DROP TRIGGER IF EXISTS update_modules_updated_at ON course_modules;

CREATE TRIGGER update_modules_updated_at
    BEFORE UPDATE ON course_modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
