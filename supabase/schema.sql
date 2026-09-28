-- ============================================================
-- ComptaPilot — Schéma Supabase (Phase 1 MVP)
-- Inspiré du PCG 2005 Madagascar
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extension de auth.users)
-- ============================================================
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  role        TEXT NOT NULL DEFAULT 'comptable' CHECK (role IN ('admin', 'comptable')),
  company_id  UUID,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- COMPANIES
-- ============================================================
CREATE TABLE companies (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  address        TEXT,
  phone          TEXT,
  email          TEXT,
  nif            TEXT,
  stat           TEXT,
  logo_url       TEXT,
  currency       TEXT NOT NULL DEFAULT 'MGA',
  created_date   DATE,
  owner_id       UUID REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ACCOUNTS (Plan comptable)
-- ============================================================
CREATE TABLE accounts (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id     UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  number         TEXT NOT NULL,
  label          TEXT NOT NULL,
  class          CHAR(1) NOT NULL CHECK (class IN ('1','2','3','4','5','6','7')),
  type           TEXT NOT NULL DEFAULT 'mixte'
                   CHECK (type IN ('actif','passif','charge','produit','mixte')),
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  parent_number  TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (company_id, number)
);

CREATE INDEX idx_accounts_company ON accounts(company_id);
CREATE INDEX idx_accounts_number  ON accounts(company_id, number);

-- ============================================================
-- JOURNAL ENTRIES (En-têtes d'écritures)
-- ============================================================
CREATE TABLE journal_entries (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id     UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  date           DATE NOT NULL,
  reference      TEXT,
  journal        TEXT NOT NULL
                   CHECK (journal IN ('ACHATS','VENTES','BANQUE','CAISSE','OPERATIONS')),
  label          TEXT NOT NULL,
  is_balanced    BOOLEAN NOT NULL DEFAULT FALSE,
  is_validated   BOOLEAN NOT NULL DEFAULT FALSE,
  created_by     UUID REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_je_company ON journal_entries(company_id);
CREATE INDEX idx_je_date    ON journal_entries(company_id, date);

-- ============================================================
-- JOURNAL ENTRY LINES (Lignes d'écritures)
-- ============================================================
CREATE TABLE journal_entry_lines (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id       UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id     UUID NOT NULL REFERENCES accounts(id),
  label          TEXT NOT NULL DEFAULT '',
  debit          NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (debit >= 0),
  credit         NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (credit >= 0),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT one_side_only CHECK (NOT (debit > 0 AND credit > 0))
);

CREATE INDEX idx_jel_entry   ON journal_entry_lines(entry_id);
CREATE INDEX idx_jel_account ON journal_entry_lines(account_id);

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE customers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  phone       TEXT,
  email       TEXT,
  address     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SUPPLIERS
-- ============================================================
CREATE TABLE suppliers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  phone       TEXT,
  email       TEXT,
  address     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INVOICES (Phase 2)
-- ============================================================
CREATE TABLE invoices (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  number        TEXT NOT NULL,
  date          DATE NOT NULL,
  due_date      DATE,
  customer_id   UUID REFERENCES customers(id),
  status        TEXT NOT NULL DEFAULT 'brouillon'
                  CHECK (status IN ('brouillon','envoyee','payee','partiel','impayee')),
  subtotal      NUMERIC(18,2) NOT NULL DEFAULT 0,
  tax_rate      NUMERIC(5,2) NOT NULL DEFAULT 20,
  tax_amount    NUMERIC(18,2) NOT NULL DEFAULT 0,
  total_ttc     NUMERIC(18,2) NOT NULL DEFAULT 0,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INVOICE ITEMS
-- ============================================================
CREATE TABLE invoice_items (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id   UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description  TEXT NOT NULL,
  quantity     NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price   NUMERIC(18,2) NOT NULL DEFAULT 0,
  total        NUMERIC(18,2) NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PRODUCTS / STOCK (Phase 2)
-- ============================================================
CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  reference       TEXT,
  name            TEXT NOT NULL,
  category        TEXT,
  unit            TEXT DEFAULT 'unité',
  purchase_price  NUMERIC(18,2) NOT NULL DEFAULT 0,
  sale_price      NUMERIC(18,2) NOT NULL DEFAULT 0,
  stock_min       NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock_current   NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- STOCK MOVEMENTS (Phase 2)
-- ============================================================
CREATE TABLE stock_movements (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id   UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  product_id   UUID NOT NULL REFERENCES products(id),
  date         DATE NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('entree','sortie','inventaire')),
  quantity     NUMERIC(10,2) NOT NULL,
  unit_price   NUMERIC(18,2),
  reference    TEXT,
  label        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- COST CENTERS — Centres de coûts (Phase 3)
-- ============================================================
CREATE TABLE cost_centers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  code        TEXT NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ANALYTICAL ENTRIES (Phase 3)
-- ============================================================
CREATE TABLE analytical_entries (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id       UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  journal_line_id  UUID REFERENCES journal_entry_lines(id),
  cost_center_id   UUID REFERENCES cost_centers(id),
  amount           NUMERIC(18,2) NOT NULL,
  percentage       NUMERIC(5,2),
  label            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SETTINGS
-- ============================================================
CREATE TABLE settings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  key         TEXT NOT NULL,
  value       JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (company_id, key)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS
ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies             ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries       ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines   ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers             ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers             ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices              ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE products              ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements       ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_centers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytical_entries    ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings              ENABLE ROW LEVEL SECURITY;

-- Helper: get user's company_id
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID LANGUAGE SQL SECURITY DEFINER AS $$
  SELECT company_id FROM profiles WHERE id = auth.uid();
$$;

-- Profiles: user can only see/edit their own profile
CREATE POLICY "profiles_own" ON profiles
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Companies: user can access their company
CREATE POLICY "companies_member" ON companies
  USING (id = get_user_company_id() OR owner_id = auth.uid());

CREATE POLICY "companies_insert" ON companies
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Generic company data policies
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['accounts','journal_entries','customers','suppliers','products','cost_centers','settings'] LOOP
    EXECUTE format(
      'CREATE POLICY %I_company_read ON %I USING (company_id = get_user_company_id())', t, t
    );
    EXECUTE format(
      'CREATE POLICY %I_company_write ON %I FOR INSERT WITH CHECK (company_id = get_user_company_id())', t, t
    );
  END LOOP;
END$$;

-- Journal entry lines (join-based access)
CREATE POLICY "jel_read" ON journal_entry_lines
  USING (EXISTS (
    SELECT 1 FROM journal_entries je
    WHERE je.id = entry_id
    AND je.company_id = get_user_company_id()
  ));

-- Invoice items
CREATE POLICY "ii_read" ON invoice_items
  USING (EXISTS (
    SELECT 1 FROM invoices i
    WHERE i.id = invoice_id
    AND i.company_id = get_user_company_id()
  ));

-- Stock movements
CREATE POLICY "sm_read" ON stock_movements
  USING (company_id = get_user_company_id());

-- Analytical entries
CREATE POLICY "ae_read" ON analytical_entries
  USING (company_id = get_user_company_id());
