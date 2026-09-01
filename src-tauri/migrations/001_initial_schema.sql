-- ============================================================
-- MIGRATION 001 — Initial Schema
-- Second Brain — DSA & CP Knowledge Base
-- 
-- Creates all tables, indexes, foreign keys, and FTS5 virtual
-- table for full-text search.
-- ============================================================

-- Enable foreign key enforcement
PRAGMA foreign_keys = ON;

-- ---- Platforms ----
CREATE TABLE IF NOT EXISTS platforms (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL UNIQUE,
    type        TEXT    NOT NULL DEFAULT 'both' CHECK (type IN ('dsa', 'cp', 'both')),
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ---- Problems ----
CREATE TABLE IF NOT EXISTS problems (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    title             TEXT    NOT NULL,
    url               TEXT    NOT NULL UNIQUE,
    platform_id       INTEGER NOT NULL,
    category          TEXT    NOT NULL CHECK (category IN ('dsa', 'cp')),
    difficulty        TEXT    NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    status            TEXT    NOT NULL DEFAULT 'to_solve' CHECK (status IN ('to_solve', 'solved', 'need_revision', 'mastered')),
    approach          TEXT    NOT NULL DEFAULT '',
    key_observation   TEXT    NOT NULL DEFAULT '',
    algorithm         TEXT    NOT NULL DEFAULT '',
    why_it_works      TEXT    NOT NULL DEFAULT '',
    time_complexity   TEXT    NOT NULL DEFAULT '',
    space_complexity  TEXT    NOT NULL DEFAULT '',
    mistake           TEXT    NOT NULL DEFAULT '',
    lessons           TEXT    NOT NULL DEFAULT '',
    notes             TEXT    NOT NULL DEFAULT '',
    code              TEXT    NOT NULL DEFAULT '',
    code_language     TEXT    NOT NULL DEFAULT 'cpp' CHECK (code_language IN ('cpp', 'python', 'java', 'javascript', 'other')),
    last_solved_at    TEXT,
    last_reviewed_at  TEXT,
    next_review_date  TEXT,
    created_at        TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at        TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE RESTRICT
);

-- ---- DSA Patterns ----
CREATE TABLE IF NOT EXISTS patterns (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    group_name  TEXT    NOT NULL DEFAULT '',
    is_default  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE(name, group_name)
);

-- ---- Problem ↔ Pattern (many-to-many) ----
CREATE TABLE IF NOT EXISTS problem_patterns (
    problem_id  INTEGER NOT NULL,
    pattern_id  INTEGER NOT NULL,
    PRIMARY KEY (problem_id, pattern_id),
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    FOREIGN KEY (pattern_id) REFERENCES patterns(id) ON DELETE CASCADE
);

-- ---- CP Tags ----
CREATE TABLE IF NOT EXISTS tags (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL UNIQUE,
    type        TEXT    NOT NULL DEFAULT 'cp' CHECK (type IN ('cp', 'custom')),
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ---- Problem ↔ Tag (many-to-many) ----
CREATE TABLE IF NOT EXISTS problem_tags (
    problem_id  INTEGER NOT NULL,
    tag_id      INTEGER NOT NULL,
    PRIMARY KEY (problem_id, tag_id),
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id)     REFERENCES tags(id)     ON DELETE CASCADE
);

-- ---- Contests ----
CREATE TABLE IF NOT EXISTS contests (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT    NOT NULL,
    platform_id     INTEGER NOT NULL,
    url             TEXT    NOT NULL DEFAULT '',
    contest_date    TEXT    NOT NULL DEFAULT '',
    rating_before   INTEGER,
    rating_change   INTEGER,
    rating_after    INTEGER,
    notes           TEXT    NOT NULL DEFAULT '',
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE RESTRICT
);

-- ---- Contest ↔ Problem ----
CREATE TABLE IF NOT EXISTS contest_problems (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    contest_id      INTEGER NOT NULL,
    problem_id      INTEGER,
    problem_label   TEXT    NOT NULL DEFAULT '',
    solved          INTEGER NOT NULL DEFAULT 0,
    time_taken      INTEGER,
    notes           TEXT    NOT NULL DEFAULT '',
    FOREIGN KEY (contest_id)  REFERENCES contests(id) ON DELETE CASCADE,
    FOREIGN KEY (problem_id)  REFERENCES problems(id) ON DELETE SET NULL
);

-- ---- Revision History ----
CREATE TABLE IF NOT EXISTS revision_history (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    problem_id  INTEGER NOT NULL,
    reviewed_at TEXT    NOT NULL DEFAULT (datetime('now')),
    result      TEXT    NOT NULL CHECK (result IN ('solved', 'needed_help', 'revealed')),
    notes       TEXT    NOT NULL DEFAULT '',
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
);

-- ============================================================
-- INDEXES — for frequently filtered/sorted columns
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_problems_platform    ON problems(platform_id);
CREATE INDEX IF NOT EXISTS idx_problems_category    ON problems(category);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty  ON problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_problems_status      ON problems(status);
CREATE INDEX IF NOT EXISTS idx_problems_created     ON problems(created_at);
CREATE INDEX IF NOT EXISTS idx_problems_updated     ON problems(updated_at);
CREATE INDEX IF NOT EXISTS idx_problems_review_date ON problems(next_review_date);

CREATE INDEX IF NOT EXISTS idx_patterns_group       ON patterns(group_name);
CREATE INDEX IF NOT EXISTS idx_revision_problem     ON revision_history(problem_id);
CREATE INDEX IF NOT EXISTS idx_contests_platform    ON contests(platform_id);
CREATE INDEX IF NOT EXISTS idx_contest_problems_cid ON contest_problems(contest_id);

-- ============================================================
-- FTS5 — Full-text search across problem text fields
-- ============================================================

CREATE VIRTUAL TABLE IF NOT EXISTS problems_fts USING fts5(
    title,
    approach,
    key_observation,
    algorithm,
    why_it_works,
    mistake,
    lessons,
    notes,
    content='problems',
    content_rowid='id'
);

-- Triggers to keep FTS index in sync with the problems table

CREATE TRIGGER IF NOT EXISTS problems_fts_insert AFTER INSERT ON problems BEGIN
    INSERT INTO problems_fts(rowid, title, approach, key_observation, algorithm, why_it_works, mistake, lessons, notes)
    VALUES (new.id, new.title, new.approach, new.key_observation, new.algorithm, new.why_it_works, new.mistake, new.lessons, new.notes);
END;

CREATE TRIGGER IF NOT EXISTS problems_fts_update AFTER UPDATE ON problems BEGIN
    INSERT INTO problems_fts(problems_fts, rowid, title, approach, key_observation, algorithm, why_it_works, mistake, lessons, notes)
    VALUES ('delete', old.id, old.title, old.approach, old.key_observation, old.algorithm, old.why_it_works, old.mistake, old.lessons, old.notes);
    INSERT INTO problems_fts(rowid, title, approach, key_observation, algorithm, why_it_works, mistake, lessons, notes)
    VALUES (new.id, new.title, new.approach, new.key_observation, new.algorithm, new.why_it_works, new.mistake, new.lessons, new.notes);
END;

CREATE TRIGGER IF NOT EXISTS problems_fts_delete AFTER DELETE ON problems BEGIN
    INSERT INTO problems_fts(problems_fts, rowid, title, approach, key_observation, algorithm, why_it_works, mistake, lessons, notes)
    VALUES ('delete', old.id, old.title, old.approach, old.key_observation, old.algorithm, old.why_it_works, old.mistake, old.lessons, old.notes);
END;
