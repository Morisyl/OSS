ALTER TABLE transactions
  ADD COLUMN custom_data JSONB NOT NULL DEFAULT '{}'::jsonb;