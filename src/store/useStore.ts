import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  User, Company, Account, JournalEntry, JournalEntryLine,
} from '../types'
import {
  demoCompany, demoUser, demoAccounts, demoJournalEntries,
} from '../data/demoData'
import { generateId } from '../lib/utils'

interface AppState {
  // Auth
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void

  // Company
  company: Company | null
  updateCompany: (data: Partial<Company>) => void

  // Accounts
  accounts: Account[]
  addAccount: (account: Omit<Account, 'id' | 'created_at'>) => void
  updateAccount: (id: string, data: Partial<Account>) => void
  toggleAccount: (id: string) => void

  // Journal
  journalEntries: JournalEntry[]
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'created_at'>) => void
  updateJournalEntry: (id: string, data: Partial<JournalEntry>) => void
  deleteJournalEntry: (id: string) => void
  validateJournalEntry: (id: string) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ── AUTH ─────────────────────────────────────────────
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        // Demo credentials
        if (
          (email === 'demo@comptapilot.mg' && password === 'demo1234') ||
          (email === 'admin@soamamy.mg' && password === 'admin1234')
        ) {
          set({
            user: demoUser,
            isAuthenticated: true,
            company: demoCompany,
            accounts: demoAccounts,
            journalEntries: demoJournalEntries,
          })
          return { success: true }
        }
        return { success: false, error: 'Identifiants incorrects.' }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
      },

      // ── COMPANY ──────────────────────────────────────────
      company: null,

      updateCompany: (data) => {
        const current = get().company
        if (!current) return
        set({ company: { ...current, ...data } })
      },

      // ── ACCOUNTS ─────────────────────────────────────────
      accounts: [],

      addAccount: (account) => {
        const newAccount: Account = {
          ...account,
          id: `acc-${generateId()}`,
          created_at: new Date().toISOString(),
        }
        set((state) => ({ accounts: [...state.accounts, newAccount] }))
      },

      updateAccount: (id, data) => {
        set((state) => ({
          accounts: state.accounts.map((a) => (a.id === id ? { ...a, ...data } : a)),
        }))
      },

      toggleAccount: (id) => {
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === id ? { ...a, is_active: !a.is_active } : a,
          ),
        }))
      },

      // ── JOURNAL ──────────────────────────────────────────
      journalEntries: [],

      addJournalEntry: (entry) => {
        const newEntry: JournalEntry = {
          ...entry,
          id: `je-${generateId()}`,
          created_at: new Date().toISOString(),
          lines: entry.lines?.map((l) => ({
            ...l,
            id: `jl-${generateId()}`,
            created_at: new Date().toISOString(),
          })),
        }
        set((state) => ({
          journalEntries: [...state.journalEntries, newEntry].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          ),
        }))
      },

      updateJournalEntry: (id, data) => {
        set((state) => ({
          journalEntries: state.journalEntries.map((e) =>
            e.id === id ? { ...e, ...data } : e,
          ),
        }))
      },

      deleteJournalEntry: (id) => {
        set((state) => ({
          journalEntries: state.journalEntries.filter((e) => e.id !== id),
        }))
      },

      validateJournalEntry: (id) => {
        set((state) => ({
          journalEntries: state.journalEntries.map((e) =>
            e.id === id ? { ...e, is_validated: true } : e,
          ),
        }))
      },
    }),
    {
      name: 'comptapilot-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        company: state.company,
        accounts: state.accounts,
        journalEntries: state.journalEntries,
      }),
    },
  ),
)
