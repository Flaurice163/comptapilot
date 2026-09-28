// ============================================================
// CORE TYPES — ComptaPilot
// ============================================================

export interface User {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'comptable'
  company_id: string | null
  avatar_url?: string
  created_at: string
}

export interface Company {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  nif?: string
  stat?: string
  logo_url?: string
  currency: string
  created_date?: string
  owner_id: string
  created_at: string
}

// ============================================================
// PLAN COMPTABLE
// ============================================================

export type AccountClass = '1' | '2' | '3' | '4' | '5' | '6' | '7'
export type AccountType = 'actif' | 'passif' | 'charge' | 'produit' | 'mixte'

export interface Account {
  id: string
  company_id: string
  number: string
  label: string
  class: AccountClass
  type: AccountType
  is_active: boolean
  parent_number?: string
  created_at: string
}

// ============================================================
// JOURNAL COMPTABLE
// ============================================================

export type JournalType = 'ACHATS' | 'VENTES' | 'BANQUE' | 'CAISSE' | 'OPERATIONS'

export interface JournalEntry {
  id: string
  company_id: string
  date: string
  reference: string
  journal: JournalType
  label: string
  is_balanced: boolean
  is_validated: boolean
  created_by: string
  created_at: string
  lines?: JournalEntryLine[]
}

export interface JournalEntryLine {
  id: string
  entry_id: string
  account_id: string
  account_number?: string
  account_label?: string
  label: string
  debit: number
  credit: number
  created_at: string
}

// ============================================================
// GRAND LIVRE
// ============================================================

export interface GrandLivreRow {
  date: string
  reference: string
  journal: JournalType
  label: string
  debit: number
  credit: number
  balance: number
  entry_id: string
}

export interface GrandLivreAccount {
  account: Account
  rows: GrandLivreRow[]
  total_debit: number
  total_credit: number
  balance: number
}

// ============================================================
// BALANCE
// ============================================================

export interface BalanceRow {
  account_number: string
  account_label: string
  account_class: AccountClass
  total_debit: number
  total_credit: number
  solde_debiteur: number
  solde_crediteur: number
}

// ============================================================
// COMPTE DE RÉSULTAT
// ============================================================

export interface ResultatItem {
  account_number: string
  account_label: string
  amount: number
}

export interface CompteResultat {
  produits: ResultatItem[]
  charges: ResultatItem[]
  total_produits: number
  total_charges: number
  resultat: number
}

// ============================================================
// BILAN
// ============================================================

export interface BilanItem {
  account_number: string
  account_label: string
  amount: number
}

export interface Bilan {
  actif: {
    immobilisations: BilanItem[]
    stocks: BilanItem[]
    creances: BilanItem[]
    tresorerie: BilanItem[]
    total: number
  }
  passif: {
    capitaux: BilanItem[]
    dettes: BilanItem[]
    resultat: number
    total: number
  }
  is_balanced: boolean
}

// ============================================================
// KPI DASHBOARD
// ============================================================

export interface DashboardKPI {
  chiffre_affaires: number
  total_charges: number
  resultat: number
  tresorerie: number
}

export interface Alert {
  id: string
  type: 'warning' | 'error' | 'info'
  message: string
  created_at: string
}

// ============================================================
// HELPERS
// ============================================================

export type Period = {
  start: string
  end: string
}

export const JOURNAL_LABELS: Record<JournalType, string> = {
  ACHATS: 'Journal des Achats',
  VENTES: 'Journal des Ventes',
  BANQUE: 'Journal de Banque',
  CAISSE: 'Journal de Caisse',
  OPERATIONS: 'Opérations Diverses',
}

export const CLASS_LABELS: Record<AccountClass, string> = {
  '1': 'Classe 1 — Capitaux',
  '2': 'Classe 2 — Immobilisations',
  '3': 'Classe 3 — Stocks',
  '4': 'Classe 4 — Tiers',
  '5': 'Classe 5 — Trésorerie',
  '6': 'Classe 6 — Charges',
  '7': 'Classe 7 — Produits',
}

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  actif: 'Actif',
  passif: 'Passif',
  charge: 'Charge',
  produit: 'Produit',
  mixte: 'Mixte',
}
