-- ============================================================
-- OSS — MIGRATION 001: INITIAL SCHEMA
-- Run this first in the Supabase SQL Editor.
-- Creates all ENUM types, tables, and constraints.
-- ============================================================


-- ── ENUM TYPES ───────────────────────────────────────────────

CREATE TYPE payment_status AS ENUM (
  'Unpaid',
  'Partial',
  'Paid'
);

CREATE TYPE progress_status AS ENUM (
  'Pending',
  'Complete'
);

CREATE TYPE task_status AS ENUM (
  'Pending',
  'Done'
);


-- ── TABLES ───────────────────────────────────────────────────

-- Clients
-- Stores all client records. A client can have many transactions.
CREATE TABLE clients (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Services
-- The base catalogue of individual services offered.
-- Services are grouped into packages.
CREATE TABLE services (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Packages
-- A named bundle of services sold at a set price.
CREATE TABLE packages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  price      NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Package Services (Junction)
-- Defines which services are included in which package.
-- Composite primary key prevents duplicate entries.
CREATE TABLE package_services (
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (package_id, service_id)
);

-- Transactions
-- The core of the system. One record per client transaction.
CREATE TABLE transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  client_id       UUID NOT NULL REFERENCES clients(id),
  package_id      UUID NOT NULL REFERENCES packages(id),
  company_name    TEXT,
  paid_amount     NUMERIC(10, 2) NOT NULL DEFAULT 0,
  balance         NUMERIC(10, 2) GENERATED ALWAYS AS (
                    GREATEST((SELECT price FROM packages WHERE id = package_id) - paid_amount, 0)
                  ) STORED,
  payment_status  payment_status NOT NULL DEFAULT 'Unpaid',
  progress_status progress_status NOT NULL DEFAULT 'Pending',
  comments        TEXT
);

-- Transaction Services
-- Live task tracking for each service within a specific transaction.
-- Seeded automatically by the edge function when a transaction is created.
CREATE TABLE transaction_services (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  service_id     UUID NOT NULL REFERENCES services(id),
  task_status    task_status NOT NULL DEFAULT 'Pending',
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ── INDEXES ──────────────────────────────────────────────────
-- Speed up the most common queries.

-- Find all transactions for a client
CREATE INDEX idx_transactions_client_id ON transactions(client_id);

-- Sort transactions by creation date (default UI sort)
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- Filter active transactions by progress
CREATE INDEX idx_transactions_progress_status ON transactions(progress_status);

-- Find all tasks for a transaction
CREATE INDEX idx_transaction_services_transaction_id ON transaction_services(transaction_id);

-- Phone number lookup (used when logging a new transaction)
CREATE INDEX idx_clients_phone ON clients(phone_number);


-- ── UPDATED_AT TRIGGER ───────────────────────────────────────
-- Keeps transaction_services.updated_at current on every update.

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_transaction_services_updated_at
  BEFORE UPDATE ON transaction_services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
