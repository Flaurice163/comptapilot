import type { Company, Account, JournalEntry, User } from '../types'

// ============================================================
// DEMO COMPANY
// ============================================================
export const demoCompany: Company = {
  id: 'demo-company-1',
  name: 'SOAMAMY SARL',
  address: 'Lot 15 Rue du Commerce, Toamasina 501, Madagascar',
  phone: '+261 20 53 123 45',
  email: 'contact@soamamy.mg',
  nif: '1234567890',
  stat: '12345/67/2019/01234',
  currency: 'MGA',
  created_date: '2019-01-15',
  owner_id: 'demo-user-1',
  created_at: '2019-01-15T08:00:00Z',
}

// ============================================================
// DEMO USER
// ============================================================
export const demoUser: User = {
  id: 'demo-user-1',
  email: 'demo@comptapilot.mg',
  full_name: 'Admin Démo',
  role: 'admin',
  company_id: 'demo-company-1',
  created_at: '2019-01-15T08:00:00Z',
}

// ============================================================
// PLAN COMPTABLE — PCG 2005 MADAGASCAR
// ============================================================
export const demoAccounts: Account[] = [
  // CLASSE 1 — CAPITAUX
  { id: 'acc-101', company_id: 'demo-company-1', number: '101', label: 'Capital social', class: '1', type: 'passif', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-106', company_id: 'demo-company-1', number: '106', label: 'Réserves', class: '1', type: 'passif', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-110', company_id: 'demo-company-1', number: '110', label: 'Report à nouveau', class: '1', type: 'passif', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-120', company_id: 'demo-company-1', number: '120', label: 'Résultat de l\'exercice', class: '1', type: 'passif', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-164', company_id: 'demo-company-1', number: '164', label: 'Emprunts auprès des établissements de crédit', class: '1', type: 'passif', is_active: true, created_at: '2024-01-01T00:00:00Z' },

  // CLASSE 2 — IMMOBILISATIONS
  { id: 'acc-211', company_id: 'demo-company-1', number: '211', label: 'Terrains', class: '2', type: 'actif', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-213', company_id: 'demo-company-1', number: '213', label: 'Constructions', class: '2', type: 'actif', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-215', company_id: 'demo-company-1', number: '215', label: 'Installations techniques, matériels et outillage', class: '2', type: 'actif', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-218', company_id: 'demo-company-1', number: '218', label: 'Autres immobilisations corporelles', class: '2', type: 'actif', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-280', company_id: 'demo-company-1', number: '280', label: 'Amortissements des immobilisations incorporelles', class: '2', type: 'actif', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-281', company_id: 'demo-company-1', number: '281', label: 'Amortissements des immobilisations corporelles', class: '2', type: 'actif', is_active: true, created_at: '2024-01-01T00:00:00Z' },

  // CLASSE 3 — STOCKS
  { id: 'acc-310', company_id: 'demo-company-1', number: '310', label: 'Stocks de matières premières', class: '3', type: 'actif', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-350', company_id: 'demo-company-1', number: '350', label: 'Stocks de produits finis', class: '3', type: 'actif', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-370', company_id: 'demo-company-1', number: '370', label: 'Stocks de marchandises', class: '3', type: 'actif', is_active: true, created_at: '2024-01-01T00:00:00Z' },

  // CLASSE 4 — TIERS
  { id: 'acc-401', company_id: 'demo-company-1', number: '401', label: 'Fournisseurs', class: '4', type: 'passif', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-404', company_id: 'demo-company-1', number: '404', label: 'Fournisseurs d\'immobilisations', class: '4', type: 'passif', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-411', company_id: 'demo-company-1', number: '411', label: 'Clients', class: '4', type: 'actif', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-421', company_id: 'demo-company-1', number: '421', label: 'Personnel — Rémunérations dues', class: '4', type: 'passif', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-431', company_id: 'demo-company-1', number: '431', label: 'Sécurité sociale', class: '4', type: 'passif', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-441', company_id: 'demo-company-1', number: '441', label: 'État — Impôts et taxes recouvrables', class: '4', type: 'actif', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-447', company_id: 'demo-company-1', number: '447', label: 'État — Autres impôts et taxes', class: '4', type: 'passif', is_active: true, created_at: '2024-01-01T00:00:00Z' },

  // CLASSE 5 — TRÉSORERIE
  { id: 'acc-511', company_id: 'demo-company-1', number: '511', label: 'Banques — Comptes courants', class: '5', type: 'actif', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-521', company_id: 'demo-company-1', number: '521', label: 'Banques — Comptes à terme', class: '5', type: 'actif', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-571', company_id: 'demo-company-1', number: '571', label: 'Caisse', class: '5', type: 'actif', is_active: true, created_at: '2024-01-01T00:00:00Z' },

  // CLASSE 6 — CHARGES
  { id: 'acc-601', company_id: 'demo-company-1', number: '601', label: 'Achats de matières premières', class: '6', type: 'charge', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-607', company_id: 'demo-company-1', number: '607', label: 'Achats de marchandises', class: '6', type: 'charge', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-611', company_id: 'demo-company-1', number: '611', label: 'Sous-traitance générale', class: '6', type: 'charge', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-613', company_id: 'demo-company-1', number: '613', label: 'Locations', class: '6', type: 'charge', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-616', company_id: 'demo-company-1', number: '616', label: 'Primes d\'assurance', class: '6', type: 'charge', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-621', company_id: 'demo-company-1', number: '621', label: 'Personnel extérieur à l\'entreprise', class: '6', type: 'charge', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-626', company_id: 'demo-company-1', number: '626', label: 'Frais postaux et de télécommunications', class: '6', type: 'charge', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-627', company_id: 'demo-company-1', number: '627', label: 'Services bancaires et assimilés', class: '6', type: 'charge', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-641', company_id: 'demo-company-1', number: '641', label: 'Rémunérations du personnel', class: '6', type: 'charge', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-645', company_id: 'demo-company-1', number: '645', label: 'Charges de sécurité sociale', class: '6', type: 'charge', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-651', company_id: 'demo-company-1', number: '651', label: 'Redevances pour concessions, brevets', class: '6', type: 'charge', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-661', company_id: 'demo-company-1', number: '661', label: 'Charges d\'intérêts', class: '6', type: 'charge', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-681', company_id: 'demo-company-1', number: '681', label: 'Dotations aux amortissements', class: '6', type: 'charge', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-695', company_id: 'demo-company-1', number: '695', label: 'Impôts sur les bénéfices', class: '6', type: 'charge', is_active: true, created_at: '2024-01-01T00:00:00Z' },

  // CLASSE 7 — PRODUITS
  { id: 'acc-701', company_id: 'demo-company-1', number: '701', label: 'Ventes de produits finis', class: '7', type: 'produit', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-706', company_id: 'demo-company-1', number: '706', label: 'Prestations de services', class: '7', type: 'produit', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-707', company_id: 'demo-company-1', number: '707', label: 'Ventes de marchandises', class: '7', type: 'produit', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-713', company_id: 'demo-company-1', number: '713', label: 'Variation des stocks de produits finis', class: '7', type: 'produit', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-740', company_id: 'demo-company-1', number: '740', label: 'Subventions d\'exploitation', class: '7', type: 'produit', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-756', company_id: 'demo-company-1', number: '756', label: 'Produits financiers de participations', class: '7', type: 'produit', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-761', company_id: 'demo-company-1', number: '761', label: 'Produits d\'intérêts', class: '7', type: 'produit', is_active: true, created_at: '2024-01-01T00:00:00Z' },
]

// Helper lookup
export const accountMap = new Map(demoAccounts.map(a => [a.number, a]))
export const accountById = new Map(demoAccounts.map(a => [a.id, a]))

// ============================================================
// DEMO JOURNAL ENTRIES — EXERCICE 2024
// ============================================================
export const demoJournalEntries: JournalEntry[] = [
  // 1 — Apport en capital
  {
    id: 'je-001',
    company_id: 'demo-company-1',
    date: '2024-01-02',
    reference: 'OD-0001',
    journal: 'OPERATIONS',
    label: 'Apport en capital — constitution de la société',
    is_balanced: true,
    is_validated: true,
    created_by: 'demo-user-1',
    created_at: '2024-01-02T08:00:00Z',
    lines: [
      { id: 'jl-001-1', entry_id: 'je-001', account_id: 'acc-511', account_number: '511', account_label: 'Banques — Comptes courants', label: 'Apport en capital', debit: 50_000_000, credit: 0, created_at: '2024-01-02T08:00:00Z' },
      { id: 'jl-001-2', entry_id: 'je-001', account_id: 'acc-101', account_number: '101', account_label: 'Capital social', label: 'Capital SOAMAMY SARL', debit: 0, credit: 50_000_000, created_at: '2024-01-02T08:00:00Z' },
    ],
  },

  // 2 — Achat de marchandises
  {
    id: 'je-002',
    company_id: 'demo-company-1',
    date: '2024-01-10',
    reference: 'ACH-0001',
    journal: 'ACHATS',
    label: 'Achat de marchandises — Fournisseur TANA IMPORT',
    is_balanced: true,
    is_validated: true,
    created_by: 'demo-user-1',
    created_at: '2024-01-10T09:00:00Z',
    lines: [
      { id: 'jl-002-1', entry_id: 'je-002', account_id: 'acc-607', account_number: '607', account_label: 'Achats de marchandises', label: 'Marchandises TANA IMPORT', debit: 12_000_000, credit: 0, created_at: '2024-01-10T09:00:00Z' },
      { id: 'jl-002-2', entry_id: 'je-002', account_id: 'acc-401', account_number: '401', account_label: 'Fournisseurs', label: 'TANA IMPORT', debit: 0, credit: 12_000_000, created_at: '2024-01-10T09:00:00Z' },
    ],
  },

  // 3 — Règlement fournisseur
  {
    id: 'je-003',
    company_id: 'demo-company-1',
    date: '2024-01-15',
    reference: 'BQ-0001',
    journal: 'BANQUE',
    label: 'Règlement fournisseur TANA IMPORT',
    is_balanced: true,
    is_validated: true,
    created_by: 'demo-user-1',
    created_at: '2024-01-15T10:00:00Z',
    lines: [
      { id: 'jl-003-1', entry_id: 'je-003', account_id: 'acc-401', account_number: '401', account_label: 'Fournisseurs', label: 'TANA IMPORT — règlement', debit: 12_000_000, credit: 0, created_at: '2024-01-15T10:00:00Z' },
      { id: 'jl-003-2', entry_id: 'je-003', account_id: 'acc-511', account_number: '511', account_label: 'Banques — Comptes courants', label: 'Virement bancaire', debit: 0, credit: 12_000_000, created_at: '2024-01-15T10:00:00Z' },
    ],
  },

  // 4 — Vente de marchandises (janvier)
  {
    id: 'je-004',
    company_id: 'demo-company-1',
    date: '2024-01-20',
    reference: 'VTE-0001',
    journal: 'VENTES',
    label: 'Vente de marchandises — Client ANALAKELY SARL',
    is_balanced: true,
    is_validated: true,
    created_by: 'demo-user-1',
    created_at: '2024-01-20T11:00:00Z',
    lines: [
      { id: 'jl-004-1', entry_id: 'je-004', account_id: 'acc-411', account_number: '411', account_label: 'Clients', label: 'ANALAKELY SARL — facture VTE-001', debit: 18_000_000, credit: 0, created_at: '2024-01-20T11:00:00Z' },
      { id: 'jl-004-2', entry_id: 'je-004', account_id: 'acc-707', account_number: '707', account_label: 'Ventes de marchandises', label: 'CA — ANALAKELY SARL', debit: 0, credit: 18_000_000, created_at: '2024-01-20T11:00:00Z' },
    ],
  },

  // 5 — Encaissement client
  {
    id: 'je-005',
    company_id: 'demo-company-1',
    date: '2024-01-28',
    reference: 'BQ-0002',
    journal: 'BANQUE',
    label: 'Encaissement ANALAKELY SARL',
    is_balanced: true,
    is_validated: true,
    created_by: 'demo-user-1',
    created_at: '2024-01-28T14:00:00Z',
    lines: [
      { id: 'jl-005-1', entry_id: 'je-005', account_id: 'acc-511', account_number: '511', account_label: 'Banques — Comptes courants', label: 'Encaissement facture VTE-001', debit: 18_000_000, credit: 0, created_at: '2024-01-28T14:00:00Z' },
      { id: 'jl-005-2', entry_id: 'je-005', account_id: 'acc-411', account_number: '411', account_label: 'Clients', label: 'ANALAKELY SARL — paiement', debit: 0, credit: 18_000_000, created_at: '2024-01-28T14:00:00Z' },
    ],
  },

  // 6 — Charges de loyer (février)
  {
    id: 'je-006',
    company_id: 'demo-company-1',
    date: '2024-02-01',
    reference: 'OD-0002',
    journal: 'OPERATIONS',
    label: 'Loyer — Bureau Toamasina — Février 2024',
    is_balanced: true,
    is_validated: true,
    created_by: 'demo-user-1',
    created_at: '2024-02-01T08:00:00Z',
    lines: [
      { id: 'jl-006-1', entry_id: 'je-006', account_id: 'acc-613', account_number: '613', account_label: 'Locations', label: 'Loyer bureau — Février', debit: 1_500_000, credit: 0, created_at: '2024-02-01T08:00:00Z' },
      { id: 'jl-006-2', entry_id: 'je-006', account_id: 'acc-511', account_number: '511', account_label: 'Banques — Comptes courants', label: 'Paiement loyer', debit: 0, credit: 1_500_000, created_at: '2024-02-01T08:00:00Z' },
    ],
  },

  // 7 — Vente de services (février)
  {
    id: 'je-007',
    company_id: 'demo-company-1',
    date: '2024-02-10',
    reference: 'VTE-0002',
    journal: 'VENTES',
    label: 'Prestations de services — MAHABO CORP',
    is_balanced: true,
    is_validated: true,
    created_by: 'demo-user-1',
    created_at: '2024-02-10T09:00:00Z',
    lines: [
      { id: 'jl-007-1', entry_id: 'je-007', account_id: 'acc-411', account_number: '411', account_label: 'Clients', label: 'MAHABO CORP — facture VTE-002', debit: 8_500_000, credit: 0, created_at: '2024-02-10T09:00:00Z' },
      { id: 'jl-007-2', entry_id: 'je-007', account_id: 'acc-706', account_number: '706', account_label: 'Prestations de services', label: 'Services — MAHABO CORP', debit: 0, credit: 8_500_000, created_at: '2024-02-10T09:00:00Z' },
    ],
  },

  // 8 — Salaires (février)
  {
    id: 'je-008',
    company_id: 'demo-company-1',
    date: '2024-02-28',
    reference: 'OD-0003',
    journal: 'OPERATIONS',
    label: 'Salaires du personnel — Février 2024',
    is_balanced: true,
    is_validated: true,
    created_by: 'demo-user-1',
    created_at: '2024-02-28T16:00:00Z',
    lines: [
      { id: 'jl-008-1', entry_id: 'je-008', account_id: 'acc-641', account_number: '641', account_label: 'Rémunérations du personnel', label: 'Salaires — Février', debit: 4_200_000, credit: 0, created_at: '2024-02-28T16:00:00Z' },
      { id: 'jl-008-2', entry_id: 'je-008', account_id: 'acc-421', account_number: '421', account_label: 'Personnel — Rémunérations dues', label: 'Salaires à payer', debit: 0, credit: 4_200_000, created_at: '2024-02-28T16:00:00Z' },
    ],
  },

  // 9 — Paiement des salaires
  {
    id: 'je-009',
    company_id: 'demo-company-1',
    date: '2024-03-01',
    reference: 'BQ-0003',
    journal: 'BANQUE',
    label: 'Virement salaires — Février 2024',
    is_balanced: true,
    is_validated: true,
    created_by: 'demo-user-1',
    created_at: '2024-03-01T09:00:00Z',
    lines: [
      { id: 'jl-009-1', entry_id: 'je-009', account_id: 'acc-421', account_number: '421', account_label: 'Personnel — Rémunérations dues', label: 'Paiement salaires', debit: 4_200_000, credit: 0, created_at: '2024-03-01T09:00:00Z' },
      { id: 'jl-009-2', entry_id: 'je-009', account_id: 'acc-511', account_number: '511', account_label: 'Banques — Comptes courants', label: 'Virement salaires', debit: 0, credit: 4_200_000, created_at: '2024-03-01T09:00:00Z' },
    ],
  },

  // 10 — Vente mars
  {
    id: 'je-010',
    company_id: 'demo-company-1',
    date: '2024-03-12',
    reference: 'VTE-0003',
    journal: 'VENTES',
    label: 'Vente marchandises — AMBATOBE TRADING',
    is_balanced: true,
    is_validated: true,
    created_by: 'demo-user-1',
    created_at: '2024-03-12T10:00:00Z',
    lines: [
      { id: 'jl-010-1', entry_id: 'je-010', account_id: 'acc-411', account_number: '411', account_label: 'Clients', label: 'AMBATOBE TRADING — facture VTE-003', debit: 22_000_000, credit: 0, created_at: '2024-03-12T10:00:00Z' },
      { id: 'jl-010-2', entry_id: 'je-010', account_id: 'acc-707', account_number: '707', account_label: 'Ventes de marchandises', label: 'CA — AMBATOBE TRADING', debit: 0, credit: 22_000_000, created_at: '2024-03-12T10:00:00Z' },
    ],
  },

  // 11 — Achat mars
  {
    id: 'je-011',
    company_id: 'demo-company-1',
    date: '2024-03-15',
    reference: 'ACH-0002',
    journal: 'ACHATS',
    label: 'Achat marchandises — FIRAISANA SARL',
    is_balanced: true,
    is_validated: true,
    created_by: 'demo-user-1',
    created_at: '2024-03-15T09:00:00Z',
    lines: [
      { id: 'jl-011-1', entry_id: 'je-011', account_id: 'acc-607', account_number: '607', account_label: 'Achats de marchandises', label: 'Marchandises — FIRAISANA', debit: 14_000_000, credit: 0, created_at: '2024-03-15T09:00:00Z' },
      { id: 'jl-011-2', entry_id: 'je-011', account_id: 'acc-401', account_number: '401', account_label: 'Fournisseurs', label: 'FIRAISANA SARL', debit: 0, credit: 14_000_000, created_at: '2024-03-15T09:00:00Z' },
    ],
  },

  // 12 — Loyer mars
  {
    id: 'je-012',
    company_id: 'demo-company-1',
    date: '2024-03-01',
    reference: 'OD-0004',
    journal: 'OPERATIONS',
    label: 'Loyer bureau — Mars 2024',
    is_balanced: true,
    is_validated: true,
    created_by: 'demo-user-1',
    created_at: '2024-03-01T08:00:00Z',
    lines: [
      { id: 'jl-012-1', entry_id: 'je-012', account_id: 'acc-613', account_number: '613', account_label: 'Locations', label: 'Loyer bureau — Mars', debit: 1_500_000, credit: 0, created_at: '2024-03-01T08:00:00Z' },
      { id: 'jl-012-2', entry_id: 'je-012', account_id: 'acc-511', account_number: '511', account_label: 'Banques — Comptes courants', label: 'Paiement loyer', debit: 0, credit: 1_500_000, created_at: '2024-03-01T08:00:00Z' },
    ],
  },

  // 13 — Salaires mars
  {
    id: 'je-013',
    company_id: 'demo-company-1',
    date: '2024-03-31',
    reference: 'OD-0005',
    journal: 'OPERATIONS',
    label: 'Salaires du personnel — Mars 2024',
    is_balanced: true,
    is_validated: true,
    created_by: 'demo-user-1',
    created_at: '2024-03-31T16:00:00Z',
    lines: [
      { id: 'jl-013-1', entry_id: 'je-013', account_id: 'acc-641', account_number: '641', account_label: 'Rémunérations du personnel', label: 'Salaires — Mars', debit: 4_200_000, credit: 0, created_at: '2024-03-31T16:00:00Z' },
      { id: 'jl-013-2', entry_id: 'je-013', account_id: 'acc-511', account_number: '511', account_label: 'Banques — Comptes courants', label: 'Virement salaires', debit: 0, credit: 4_200_000, created_at: '2024-03-31T16:00:00Z' },
    ],
  },

  // 14 — Encaissement AMBATOBE
  {
    id: 'je-014',
    company_id: 'demo-company-1',
    date: '2024-04-02',
    reference: 'BQ-0004',
    journal: 'BANQUE',
    label: 'Encaissement AMBATOBE TRADING',
    is_balanced: true,
    is_validated: true,
    created_by: 'demo-user-1',
    created_at: '2024-04-02T09:00:00Z',
    lines: [
      { id: 'jl-014-1', entry_id: 'je-014', account_id: 'acc-511', account_number: '511', account_label: 'Banques — Comptes courants', label: 'Encaissement VTE-003', debit: 22_000_000, credit: 0, created_at: '2024-04-02T09:00:00Z' },
      { id: 'jl-014-2', entry_id: 'je-014', account_id: 'acc-411', account_number: '411', account_label: 'Clients', label: 'AMBATOBE TRADING — paiement', debit: 0, credit: 22_000_000, created_at: '2024-04-02T09:00:00Z' },
    ],
  },

  // 15 — Vente avril
  {
    id: 'je-015',
    company_id: 'demo-company-1',
    date: '2024-04-15',
    reference: 'VTE-0004',
    journal: 'VENTES',
    label: 'Vente marchandises — BETAFO NÉGOCE',
    is_balanced: true,
    is_validated: true,
    created_by: 'demo-user-1',
    created_at: '2024-04-15T10:00:00Z',
    lines: [
      { id: 'jl-015-1', entry_id: 'je-015', account_id: 'acc-411', account_number: '411', account_label: 'Clients', label: 'BETAFO NÉGOCE — facture VTE-004', debit: 25_000_000, credit: 0, created_at: '2024-04-15T10:00:00Z' },
      { id: 'jl-015-2', entry_id: 'je-015', account_id: 'acc-707', account_number: '707', account_label: 'Ventes de marchandises', label: 'CA — BETAFO NÉGOCE', debit: 0, credit: 25_000_000, created_at: '2024-04-15T10:00:00Z' },
    ],
  },

  // 16 — Charges diverses avril
  {
    id: 'je-016',
    company_id: 'demo-company-1',
    date: '2024-04-20',
    reference: 'OD-0006',
    journal: 'OPERATIONS',
    label: 'Frais postaux et télécommunications — Avril',
    is_balanced: true,
    is_validated: true,
    created_by: 'demo-user-1',
    created_at: '2024-04-20T10:00:00Z',
    lines: [
      { id: 'jl-016-1', entry_id: 'je-016', account_id: 'acc-626', account_number: '626', account_label: 'Frais postaux et télécommunications', label: 'Téléphone / Internet', debit: 300_000, credit: 0, created_at: '2024-04-20T10:00:00Z' },
      { id: 'jl-016-2', entry_id: 'je-016', account_id: 'acc-571', account_number: '571', account_label: 'Caisse', label: 'Paiement espèces', debit: 0, credit: 300_000, created_at: '2024-04-20T10:00:00Z' },
    ],
  },

  // 17 — Salaires avril
  {
    id: 'je-017',
    company_id: 'demo-company-1',
    date: '2024-04-30',
    reference: 'OD-0007',
    journal: 'OPERATIONS',
    label: 'Salaires du personnel — Avril 2024',
    is_balanced: true,
    is_validated: true,
    created_by: 'demo-user-1',
    created_at: '2024-04-30T16:00:00Z',
    lines: [
      { id: 'jl-017-1', entry_id: 'je-017', account_id: 'acc-641', account_number: '641', account_label: 'Rémunérations du personnel', label: 'Salaires — Avril', debit: 4_200_000, credit: 0, created_at: '2024-04-30T16:00:00Z' },
      { id: 'jl-017-2', entry_id: 'je-017', account_id: 'acc-511', account_number: '511', account_label: 'Banques — Comptes courants', label: 'Virement salaires', debit: 0, credit: 4_200_000, created_at: '2024-04-30T16:00:00Z' },
    ],
  },

  // 18 — Loyer avril
  {
    id: 'je-018',
    company_id: 'demo-company-1',
    date: '2024-04-01',
    reference: 'OD-0008',
    journal: 'OPERATIONS',
    label: 'Loyer bureau — Avril 2024',
    is_balanced: true,
    is_validated: true,
    created_by: 'demo-user-1',
    created_at: '2024-04-01T08:00:00Z',
    lines: [
      { id: 'jl-018-1', entry_id: 'je-018', account_id: 'acc-613', account_number: '613', account_label: 'Locations', label: 'Loyer bureau — Avril', debit: 1_500_000, credit: 0, created_at: '2024-04-01T08:00:00Z' },
      { id: 'jl-018-2', entry_id: 'je-018', account_id: 'acc-511', account_number: '511', account_label: 'Banques — Comptes courants', label: 'Paiement loyer', debit: 0, credit: 1_500_000, created_at: '2024-04-01T08:00:00Z' },
    ],
  },

  // 19 — Vente en caisse
  {
    id: 'je-019',
    company_id: 'demo-company-1',
    date: '2024-05-05',
    reference: 'CSS-0001',
    journal: 'CAISSE',
    label: 'Ventes au comptant — espèces',
    is_balanced: true,
    is_validated: true,
    created_by: 'demo-user-1',
    created_at: '2024-05-05T11:00:00Z',
    lines: [
      { id: 'jl-019-1', entry_id: 'je-019', account_id: 'acc-571', account_number: '571', account_label: 'Caisse', label: 'Recette caisse', debit: 3_200_000, credit: 0, created_at: '2024-05-05T11:00:00Z' },
      { id: 'jl-019-2', entry_id: 'je-019', account_id: 'acc-707', account_number: '707', account_label: 'Ventes de marchandises', label: 'Vente comptant', debit: 0, credit: 3_200_000, created_at: '2024-05-05T11:00:00Z' },
    ],
  },

  // 20 — Achat mai
  {
    id: 'je-020',
    company_id: 'demo-company-1',
    date: '2024-05-10',
    reference: 'ACH-0003',
    journal: 'ACHATS',
    label: 'Achat marchandises — TANA IMPORT',
    is_balanced: true,
    is_validated: true,
    created_by: 'demo-user-1',
    created_at: '2024-05-10T09:00:00Z',
    lines: [
      { id: 'jl-020-1', entry_id: 'je-020', account_id: 'acc-607', account_number: '607', account_label: 'Achats de marchandises', label: 'Marchandises — TANA IMPORT mai', debit: 10_000_000, credit: 0, created_at: '2024-05-10T09:00:00Z' },
      { id: 'jl-020-2', entry_id: 'je-020', account_id: 'acc-401', account_number: '401', account_label: 'Fournisseurs', label: 'TANA IMPORT — dette', debit: 0, credit: 10_000_000, created_at: '2024-05-10T09:00:00Z' },
    ],
  },
]
