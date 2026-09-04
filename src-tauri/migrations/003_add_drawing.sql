-- ============================================================
-- MIGRATION 003 — Add Drawing Board
-- Second Brain — DSA & CP Knowledge Base
-- 
-- Adds rough_work column to problems table for canvas drawing.
-- ============================================================

ALTER TABLE problems ADD COLUMN rough_work TEXT NOT NULL DEFAULT '';
