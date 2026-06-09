-- ============================================================
-- OSS — MIGRATION 003: SEED STAFF USERS
-- Run this third, after 002_rls_policies.sql.
--
-- Creates staff login accounts.
-- Usernames are stored as username@oss.local internally.
-- The login UI only shows a Username field — staff never see
-- the @oss.local suffix.
--
-- TO ADD A NEW STAFF MEMBER:
-- Go to Supabase Dashboard → Authentication → Users → Add User
-- Email:    theirusername@oss.local
-- Password: their chosen password
-- Confirm email: tick "Auto Confirm"
--
-- OR use the SQL below as a template (requires service_role key,
-- not the anon key — run only from the SQL Editor, never client-side).
-- ============================================================


-- ── CREATE INITIAL STAFF ACCOUNTS ────────────────────────────
-- Replace the placeholder passwords before running.
-- Use strong passwords — these are shared login credentials.

-- Method: Supabase provides a helper function in the auth schema.
-- This only works from the SQL Editor with service role access.

SELECT auth.create_user(
  '{
    "email": "admin@oss.local",
    "password": "Kenya@2030",
    "email_confirm": true,
    "user_metadata": { "username": "admin" }
  }'::jsonb
);

-- Add more staff below by duplicating the block above.
-- Example:
--
-- SELECT auth.create_user(
--   '{
--     "email": "jane@oss.local",
--     "password": "REPLACE_WITH_STRONG_PASSWORD",
--     "email_confirm": true,
--     "user_metadata": { "username": "jane" }
--   }'::jsonb
-- );
--
-- SELECT auth.create_user(
--   '{
--     "email": "john@oss.local",
--     "password": "REPLACE_WITH_STRONG_PASSWORD",
--     "email_confirm": true,
--     "user_metadata": { "username": "john" }
--   }'::jsonb
-- );


-- ── VERIFICATION QUERY ───────────────────────────────────────
-- Run after seeding to confirm users were created.
-- Should return one row per staff member.
--
-- SELECT id, email, created_at, email_confirmed_at
-- FROM auth.users
-- ORDER BY created_at;


-- ── PASSWORD RESET ───────────────────────────────────────────
-- To reset a staff member's password from the SQL Editor:
--
-- SELECT auth.update_user(
--   (SELECT id FROM auth.users WHERE email = 'jane@oss.local'),
--   '{"password": "NEW_STRONG_PASSWORD"}'::jsonb
-- );
