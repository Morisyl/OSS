-- ============================================================
-- OSS — MIGRATION 002: ROW LEVEL SECURITY
-- Run this second, after 001_init_schema.sql.
-- Locks every table so only authenticated sessions can read/write.
-- No roles — any valid session gets full access.
-- ============================================================


-- ── ENABLE RLS ON ALL TABLES ─────────────────────────────────

ALTER TABLE clients              ENABLE ROW LEVEL SECURITY;
ALTER TABLE services             ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages             ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_services     ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_services ENABLE ROW LEVEL SECURITY;


-- ── POLICIES ─────────────────────────────────────────────────
-- One policy per table per operation.
-- Rule: authenticated = full access. Unauthenticated = nothing.


-- clients
CREATE POLICY "authenticated users can select clients"
  ON clients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated users can insert clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated users can update clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- services
CREATE POLICY "authenticated users can select services"
  ON services FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated users can insert services"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated users can update services"
  ON services FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated users can delete services"
  ON services FOR DELETE
  TO authenticated
  USING (true);


-- packages
CREATE POLICY "authenticated users can select packages"
  ON packages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated users can insert packages"
  ON packages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated users can update packages"
  ON packages FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated users can delete packages"
  ON packages FOR DELETE
  TO authenticated
  USING (true);


-- package_services
CREATE POLICY "authenticated users can select package_services"
  ON package_services FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated users can insert package_services"
  ON package_services FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated users can delete package_services"
  ON package_services FOR DELETE
  TO authenticated
  USING (true);


-- transactions
CREATE POLICY "authenticated users can select transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated users can insert transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated users can update transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- transaction_services
CREATE POLICY "authenticated users can select transaction_services"
  ON transaction_services FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated users can insert transaction_services"
  ON transaction_services FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated users can update transaction_services"
  ON transaction_services FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ── VERIFICATION QUERY ───────────────────────────────────────
-- Run this after applying the migration to confirm all policies
-- are active. You should see 6 tables each with RLS enabled.
--
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
