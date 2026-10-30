import { create } from 'zustand'
import type {
  User, Company, Account, JournalEntry, JournalEntryLine,
} from '../types'
import {
  authenticate, changePassword, endSession, getSession, registerAccount,
  sendPasswordRecovery,
} from '../lib/authApi'
import { generateId } from '../lib/utils'

interface AuthResult {
  success: boolean
  error?: string
  warning?: string
}

interface AppState {
  user: User | null
  isAuthenticated: boolean
  authStatus: 'loading' | 'ready' | 'error'
  authError: string | null
  initializeAuth: () => Promise<void>
  login: (email: string, password: string) => Promise<AuthResult>
  register: (
    email: string,
    password: string,
    fullName: string,
    companyName: string,
  ) => Promise<AuthResult>
  requestPasswordReset: (email: string) => Promise<AuthResult>
  updatePassword: (password: string) => Promise<AuthResult>
  logout: () => Promise<AuthResult>

  company: Company | null
  updateCompany: (data: Partial<Company>) => void
  accounts: Account[]
  addAccount: (account: Omit<Account, 'id' | 'created_at'>) => void
  updateAccount: (id: string, data: Partial<Account>) => void
  toggleAccount: (id: string) => void
  journalEntries: JournalEntry[]
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'created_at'>) => void
  updateJournalEntry: (id: string, data: Partial<JournalEntry>) => void
  deleteJournalEntry: (id: string) => void
  validateJournalEntry: (id: string) => void
}

export const useStore = create<AppState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  authStatus: 'loading',
  authError: null,

  initializeAuth: async () => {
    set({ authStatus: 'loading', authError: null })
    try {
      const { user } = await getSession()
      set({ user, isAuthenticated: Boolean(user), authStatus: 'ready' })
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Impossible de vérifier la session.'
      set({ authStatus: 'error', authError: message })
    }
  },

  login: async (email, password) => {
    try {
      const { user } = await authenticate(email, password)
      set({ user, isAuthenticated: true, authStatus: 'ready', authError: null })
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de connexion.',
      }
    }
  },

  register: async (email, password, fullName, companyName) => {
    try {
      await registerAccount(email, password, fullName, companyName)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de l’inscription.',
      }
    }
  },

  requestPasswordReset: async (email) => {
    try {
      await sendPasswordRecovery(email)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Impossible d’envoyer le lien.',
      }
    }
  },

  updatePassword: async (password) => {
    try {
      await changePassword(password)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Impossible de modifier le mot de passe.',
      }
    }
  },

  logout: async () => {
    try {
      const { warning } = await endSession()
      set({ user: null, isAuthenticated: false, authStatus: 'ready', authError: null })
      return { success: true, warning }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Impossible de fermer la session.',
      }
    }
  },

  company: null,
  updateCompany: (data) => {
    const current = get().company
    if (!current) return
    set({ company: { ...current, ...data } })
  },

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
      accounts: state.accounts.map((account) =>
        account.id === id ? { ...account, ...data } : account,
      ),
    }))
  },
  toggleAccount: (id) => {
    set((state) => ({
      accounts: state.accounts.map((account) =>
        account.id === id ? { ...account, is_active: !account.is_active } : account,
      ),
    }))
  },

  journalEntries: [],
  addJournalEntry: (entry) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: `je-${generateId()}`,
      created_at: new Date().toISOString(),
      lines: entry.lines?.map((line) => ({
        ...line,
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
      journalEntries: state.journalEntries.map((entry) =>
        entry.id === id ? { ...entry, ...data } : entry,
      ),
    }))
  },
  deleteJournalEntry: (id) => {
    set((state) => ({
      journalEntries: state.journalEntries.filter((entry) => entry.id !== id),
    }))
  },
  validateJournalEntry: (id) => {
    set((state) => ({
      journalEntries: state.journalEntries.map((entry) =>
        entry.id === id ? { ...entry, is_validated: true } : entry,
      ),
    }))
  },
}))
