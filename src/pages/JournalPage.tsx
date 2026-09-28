import { useState, useMemo } from 'react'
import {
  Plus, Search, Pencil, Trash2, CheckCircle2, AlertCircle,
  X, Check, Filter, FileText,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { useStore } from '@/store/useStore'
import type { JournalType, JournalEntryLine } from '@/types'
import { JOURNAL_LABELS } from '@/types'
import { formatDate, formatNumber, generateId, isBalanced } from '@/lib/utils'

const JOURNAL_TYPES: JournalType[] = ['VENTES', 'ACHATS', 'BANQUE', 'CAISSE', 'OPERATIONS']

const JOURNAL_BADGE: Record<JournalType, 'success' | 'warning' | 'info' | 'purple' | 'secondary'> = {
  VENTES: 'success',
  ACHATS: 'warning',
  BANQUE: 'info',
  CAISSE: 'purple',
  OPERATIONS: 'secondary',
}

const JOURNAL_SHORT: Record<JournalType, string> = {
  VENTES: 'Ventes',
  ACHATS: 'Achats',
  BANQUE: 'Banque',
  CAISSE: 'Caisse',
  OPERATIONS: 'OD',
}

interface LineForm {
  id: string
  account_number: string
  label: string
  debit: string
  credit: string
}

const newLine = (): LineForm => ({
  id: generateId(),
  account_number: '',
  label: '',
  debit: '',
  credit: '',
})

const defaultEntry = () => ({
  date: new Date().toISOString().split('T')[0],
  reference: '',
  journal: 'OPERATIONS' as JournalType,
  label: '',
  lines: [newLine(), newLine()],
})

export default function JournalPage() {
  const { accounts, journalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry } = useStore()

  const [search, setSearch] = useState('')
  const [filterJournal, setFilterJournal] = useState<JournalType | 'all'>('all')
  const [filterStart, setFilterStart] = useState('')
  const [filterEnd, setFilterEnd] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 15

  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(defaultEntry)
  const [formError, setFormError] = useState('')

  const activeAccounts = useMemo(
    () => accounts.filter((a) => a.is_active).sort((a, b) => a.number.localeCompare(b.number)),
    [accounts],
  )

  // Totals
  const totalDebit = useMemo(
    () => form.lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0),
    [form.lines],
  )
  const totalCredit = useMemo(
    () => form.lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0),
    [form.lines],
  )
  const balanced = isBalanced(totalDebit, totalCredit) && totalDebit > 0

  // Filtered entries
  const filtered = useMemo(() => {
    return journalEntries
      .filter((e) => {
        if (filterJournal !== 'all' && e.journal !== filterJournal) return false
        if (filterStart && e.date < filterStart) return false
        if (filterEnd && e.date > filterEnd) return false
        if (search) {
          const q = search.toLowerCase()
          return (
            e.reference.toLowerCase().includes(q) ||
            e.label.toLowerCase().includes(q) ||
            e.lines?.some(
              (l) =>
                l.account_number?.toLowerCase().includes(q) ||
                l.label.toLowerCase().includes(q),
            )
          )
        }
        return true
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [journalEntries, search, filterJournal, filterStart, filterEnd])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Entry totals helper
  const entryDebit = (entry: typeof journalEntries[0]) =>
    entry.lines?.reduce((s, l) => s + l.debit, 0) ?? 0

  const openAdd = () => {
    setForm(defaultEntry())
    setEditingId(null)
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (entryId: string) => {
    const entry = journalEntries.find((e) => e.id === entryId)
    if (!entry) return
    setForm({
      date: entry.date,
      reference: entry.reference,
      journal: entry.journal,
      label: entry.label,
      lines: (entry.lines ?? []).map((l) => ({
        id: l.id,
        account_number: l.account_number ?? '',
        label: l.label,
        debit: l.debit > 0 ? String(l.debit) : '',
        credit: l.credit > 0 ? String(l.credit) : '',
      })),
    })
    setEditingId(entryId)
    setFormError('')
    setModalOpen(true)
  }

  const updateLine = (id: string, field: keyof LineForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      lines: prev.lines.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    }))
  }

  const removeLine = (id: string) => {
    if (form.lines.length <= 2) return
    setForm((prev) => ({ ...prev, lines: prev.lines.filter((l) => l.id !== id) }))
  }

  const handleSave = () => {
    setFormError('')
    if (!form.date) { setFormError('La date est requise.'); return }
    if (!form.label.trim()) { setFormError('Le libellé est requis.'); return }
    if (!balanced) {
      setFormError(
        `L'écriture n'est pas équilibrée. Débit : ${formatNumber(totalDebit)} — Crédit : ${formatNumber(totalCredit)} Ar`,
      )
      return
    }

    const lines: Omit<JournalEntryLine, 'id' | 'created_at'>[] = form.lines
      .filter((l) => l.account_number && (parseFloat(l.debit) > 0 || parseFloat(l.credit) > 0))
      .map((l) => {
        const acc = activeAccounts.find((a) => a.number === l.account_number)
        return {
          entry_id: editingId ?? '',
          account_id: acc?.id ?? '',
          account_number: l.account_number,
          account_label: acc?.label ?? l.account_number,
          label: l.label || form.label,
          debit: parseFloat(l.debit) || 0,
          credit: parseFloat(l.credit) || 0,
        }
      })

    const company_id = accounts[0]?.company_id ?? 'demo-company-1'

    if (editingId) {
      updateJournalEntry(editingId, {
        date: form.date,
        reference: form.reference,
        journal: form.journal,
        label: form.label.trim(),
        is_balanced: true,
        lines: lines.map((l) => ({
          ...l,
          id: generateId(),
          created_at: new Date().toISOString(),
        })),
      })
    } else {
      addJournalEntry({
        company_id,
        date: form.date,
        reference: form.reference,
        journal: form.journal,
        label: form.label.trim(),
        is_balanced: true,
        is_validated: false,
        created_by: 'demo-user-1',
        lines: lines.map((l) => ({
          ...l,
          id: generateId(),
          created_at: new Date().toISOString(),
        })),
      })
    }
    setModalOpen(false)
    setPage(1)
  }

  const handleDelete = () => {
    if (deleteId) {
      deleteJournalEntry(deleteId)
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Journal comptable</h2>
          <p className="text-muted-foreground mt-1">
            {journalEntries.length} écriture{journalEntries.length !== 1 ? 's' : ''} enregistrée{journalEntries.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={openAdd} className="gap-2 sm:self-start">
          <Plus className="w-4 h-4" />
          Nouvelle écriture
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Référence, libellé, compte…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-9"
              />
            </div>
            <Select
              value={filterJournal}
              onValueChange={(v) => { setFilterJournal(v as JournalType | 'all'); setPage(1) }}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
                <Filter className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Tous les journaux" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les journaux</SelectItem>
                {JOURNAL_TYPES.map((j) => (
                  <SelectItem key={j} value={j}>{JOURNAL_LABELS[j]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">Du</Label>
              <Input
                type="date"
                value={filterStart}
                onChange={(e) => { setFilterStart(e.target.value); setPage(1) }}
                className="w-36"
              />
              <Label className="text-xs text-muted-foreground whitespace-nowrap">Au</Label>
              <Input
                type="date"
                value={filterEnd}
                onChange={(e) => { setFilterEnd(e.target.value); setPage(1) }}
                className="w-36"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            {filtered.length} écriture{filtered.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Référence</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Journal</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Libellé</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Débit</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Crédit</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground w-24">Statut</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                      Aucune écriture trouvée
                    </td>
                  </tr>
                ) : (
                  paginated.map((entry, idx) => (
                    <tr
                      key={entry.id}
                      className={`border-b last:border-0 hover:bg-muted/20 ${idx % 2 === 0 ? '' : 'bg-muted/10'}`}
                    >
                      <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
                        {formatDate(entry.date)}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs font-semibold text-primary">
                        {entry.reference || '—'}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant={JOURNAL_BADGE[entry.journal]}>
                          {JOURNAL_SHORT[entry.journal]}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 max-w-[220px]">
                        <p className="truncate font-medium">{entry.label}</p>
                        {entry.lines && entry.lines.length > 0 && (
                          <p className="text-xs text-muted-foreground truncate">
                            {entry.lines.map((l) => l.account_number).join(' / ')}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium">
                        {formatNumber(entryDebit(entry))} Ar
                      </td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground hidden md:table-cell">
                        {formatNumber(entry.lines?.reduce((s, l) => s + l.credit, 0) ?? 0)} Ar
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {entry.is_balanced ? (
                          <Badge variant="success">Équilibrée</Badge>
                        ) : (
                          <Badge variant="destructive">Déséquilibrée</Badge>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(entry.id)}
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                            title="Modifier"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteId(entry.id)}
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-red-600"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Page {page} / {totalPages} — {filtered.length} résultats
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Entry Form Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Modifier l\'écriture' : 'Nouvelle écriture comptable'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Header fields */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Référence</Label>
                <Input
                  value={form.reference}
                  onChange={(e) => setForm((p) => ({ ...p, reference: e.target.value }))}
                  placeholder="OD-0001"
                  className="font-mono"
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Journal *</Label>
                <Select
                  value={form.journal}
                  onValueChange={(v) => setForm((p) => ({ ...p, journal: v as JournalType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JOURNAL_TYPES.map((j) => (
                      <SelectItem key={j} value={j}>{JOURNAL_LABELS[j]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Libellé *</Label>
              <Input
                value={form.label}
                onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                placeholder="Description de l'opération…"
              />
            </div>

            {/* Lines */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Lignes d'écriture</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setForm((p) => ({ ...p, lines: [...p.lines, newLine()] }))}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter une ligne
                </Button>
              </div>

              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Compte</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground hidden sm:table-cell">Libellé</th>
                      <th className="text-right px-3 py-2 font-medium text-muted-foreground">Débit (Ar)</th>
                      <th className="text-right px-3 py-2 font-medium text-muted-foreground">Crédit (Ar)</th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {form.lines.map((line, idx) => (
                      <tr key={line.id} className={`border-b last:border-0 ${idx % 2 === 0 ? '' : 'bg-muted/5'}`}>
                        <td className="px-2 py-1.5">
                          <select
                            value={line.account_number}
                            onChange={(e) => updateLine(line.id, 'account_number', e.target.value)}
                            className="w-full h-8 px-2 text-sm border rounded bg-background focus:outline-none focus:ring-1 focus:ring-ring font-mono"
                          >
                            <option value="">Sélectionner…</option>
                            {activeAccounts.map((a) => (
                              <option key={a.id} value={a.number}>
                                {a.number} — {a.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-1.5 hidden sm:table-cell">
                          <Input
                            value={line.label}
                            onChange={(e) => updateLine(line.id, 'label', e.target.value)}
                            placeholder="Libellé"
                            className="h-8 text-sm"
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            value={line.debit}
                            onChange={(e) => {
                              updateLine(line.id, 'debit', e.target.value)
                              if (e.target.value) updateLine(line.id, 'credit', '')
                            }}
                            placeholder="0"
                            className="h-8 text-right text-sm"
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            value={line.credit}
                            onChange={(e) => {
                              updateLine(line.id, 'credit', e.target.value)
                              if (e.target.value) updateLine(line.id, 'debit', '')
                            }}
                            placeholder="0"
                            className="h-8 text-right text-sm"
                          />
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          <button
                            onClick={() => removeLine(line.id)}
                            disabled={form.lines.length <= 2}
                            className="text-muted-foreground hover:text-destructive disabled:opacity-30"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/30 border-t font-semibold">
                      <td colSpan={2} className="px-3 py-2 text-muted-foreground">Total</td>
                      <td className="px-3 py-2 text-right">{formatNumber(totalDebit)} Ar</td>
                      <td className="px-3 py-2 text-right">{formatNumber(totalCredit)} Ar</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Balance indicator */}
              <div className={`mt-2 flex items-center gap-2 text-sm px-3 py-2 rounded-lg border ${
                totalDebit === 0 && totalCredit === 0
                  ? 'bg-muted text-muted-foreground border-border'
                  : balanced
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                {balanced ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ) : totalDebit === 0 && totalCredit === 0 ? null : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                {balanced
                  ? 'Écriture équilibrée — prête à être enregistrée.'
                  : totalDebit === 0 && totalCredit === 0
                  ? 'Saisissez les montants débit et crédit.'
                  : `Écriture non équilibrée. Différence : ${formatNumber(Math.abs(totalDebit - totalCredit))} Ar`
                }
              </div>
            </div>

            {formError && (
              <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {formError}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              <X className="w-4 h-4 mr-1" /> Annuler
            </Button>
            <Button onClick={handleSave} disabled={!balanced}>
              <Check className="w-4 h-4 mr-1" /> Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. L'écriture et toutes ses lignes seront définitivement supprimées.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-1" /> Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
