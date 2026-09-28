import { useState, useMemo } from 'react'
import { Plus, Search, Pencil, PowerOff, BookOpen, X, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { useStore } from '@/store/useStore'
import type { Account, AccountClass, AccountType } from '@/types'
import { CLASS_LABELS, ACCOUNT_TYPE_LABELS } from '@/types'

const CLASS_OPTIONS: AccountClass[] = ['1', '2', '3', '4', '5', '6', '7']

const CLASS_COLORS: Record<AccountClass, string> = {
  '1': 'bg-purple-100 text-purple-800',
  '2': 'bg-blue-100 text-blue-800',
  '3': 'bg-cyan-100 text-cyan-800',
  '4': 'bg-orange-100 text-orange-800',
  '5': 'bg-green-100 text-green-800',
  '6': 'bg-red-100 text-red-800',
  '7': 'bg-emerald-100 text-emerald-800',
}

const TYPE_COLORS: Record<AccountType, string> = {
  actif: 'bg-blue-50 text-blue-700',
  passif: 'bg-purple-50 text-purple-700',
  charge: 'bg-red-50 text-red-700',
  produit: 'bg-green-50 text-green-700',
  mixte: 'bg-gray-50 text-gray-700',
}

const emptyForm = {
  number: '',
  label: '',
  class: '1' as AccountClass,
  type: 'actif' as AccountType,
  is_active: true,
}

export default function PlanComptablePage() {
  const { accounts, addAccount, updateAccount, toggleAccount } = useStore()
  const [search, setSearch] = useState('')
  const [filterClass, setFilterClass] = useState<AccountClass | 'all'>('all')
  const [showInactive, setShowInactive] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const filtered = useMemo(() => {
    return accounts
      .filter((a) => {
        if (!showInactive && !a.is_active) return false
        if (filterClass !== 'all' && a.class !== filterClass) return false
        if (search) {
          const q = search.toLowerCase()
          return (
            a.number.toLowerCase().includes(q) ||
            a.label.toLowerCase().includes(q)
          )
        }
        return true
      })
      .sort((a, b) => a.number.localeCompare(b.number))
  }, [accounts, search, filterClass, showInactive])

  // Counts per class
  const counts = useMemo(() => {
    const m: Record<string, number> = {}
    for (const a of accounts) {
      if (!a.is_active) continue
      m[a.class] = (m[a.class] ?? 0) + 1
    }
    return m
  }, [accounts])

  const openAdd = () => {
    setForm(emptyForm)
    setEditingId(null)
    setError('')
    setModalOpen(true)
  }

  const openEdit = (account: Account) => {
    setForm({
      number: account.number,
      label: account.label,
      class: account.class,
      type: account.type,
      is_active: account.is_active,
    })
    setEditingId(account.id)
    setError('')
    setModalOpen(true)
  }

  const handleSave = () => {
    if (!form.number.trim()) { setError('Le numéro de compte est requis.'); return }
    if (!form.label.trim()) { setError('L\'intitulé est requis.'); return }

    // Check duplicate number (except when editing same account)
    const duplicate = accounts.find(
      (a) => a.number === form.number.trim() && a.id !== editingId,
    )
    if (duplicate) { setError(`Le compte ${form.number} existe déjà.`); return }

    if (editingId) {
      updateAccount(editingId, { ...form, number: form.number.trim(), label: form.label.trim() })
    } else {
      const company = accounts[0]?.company_id ?? 'demo-company-1'
      addAccount({ ...form, number: form.number.trim(), label: form.label.trim(), company_id: company })
    }
    setModalOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Plan comptable</h2>
          <p className="text-muted-foreground mt-1">
            PCG 2005 Madagascar — {accounts.filter((a) => a.is_active).length} comptes actifs
          </p>
        </div>
        <Button onClick={openAdd} className="gap-2 sm:self-start">
          <Plus className="w-4 h-4" />
          Nouveau compte
        </Button>
      </div>

      {/* Stats par classe */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {CLASS_OPTIONS.map((cls) => (
          <button
            key={cls}
            onClick={() => setFilterClass(filterClass === cls ? 'all' : cls)}
            className={`p-2 rounded-lg border text-center transition-all ${
              filterClass === cls
                ? 'border-primary bg-primary/10 ring-1 ring-primary'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <p className="text-lg font-bold text-foreground">{cls}</p>
            <p className="text-xs text-muted-foreground">{counts[cls] ?? 0}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par numéro ou intitulé..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={filterClass}
              onValueChange={(v) => setFilterClass(v as AccountClass | 'all')}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Toutes les classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les classes</SelectItem>
                {CLASS_OPTIONS.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    Classe {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Switch
                id="show-inactive"
                checked={showInactive}
                onCheckedChange={setShowInactive}
              />
              <Label htmlFor="show-inactive" className="text-sm cursor-pointer">
                Inactifs
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-0 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            {filtered.length} compte{filtered.length !== 1 ? 's' : ''}
            {filterClass !== 'all' && ` — Classe ${filterClass}`}
          </CardTitle>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Effacer
            </button>
          )}
        </CardHeader>
        <CardContent className="p-0 mt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground w-28">Numéro</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Intitulé</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Classe</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Type</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground w-20">Statut</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      Aucun compte trouvé
                    </td>
                  </tr>
                ) : (
                  filtered.map((account, idx) => (
                    <tr
                      key={account.id}
                      className={`border-b last:border-0 hover:bg-muted/20 ${
                        !account.is_active ? 'opacity-50' : ''
                      } ${idx % 2 === 0 ? '' : 'bg-muted/10'}`}
                    >
                      <td className="px-4 py-2.5 font-mono font-semibold text-primary">
                        {account.number}
                      </td>
                      <td className="px-4 py-2.5 font-medium">{account.label}</td>
                      <td className="px-4 py-2.5 hidden sm:table-cell">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${CLASS_COLORS[account.class]}`}>
                          Cl. {account.class}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 hidden md:table-cell">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[account.type]}`}>
                          {ACCOUNT_TYPE_LABELS[account.type]}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {account.is_active ? (
                          <Badge variant="success">Actif</Badge>
                        ) : (
                          <Badge variant="secondary">Inactif</Badge>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(account)}
                            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            title="Modifier"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleAccount(account.id)}
                            className={`p-1.5 rounded hover:bg-muted transition-colors ${
                              account.is_active
                                ? 'text-muted-foreground hover:text-orange-600'
                                : 'text-muted-foreground hover:text-green-600'
                            }`}
                            title={account.is_active ? 'Désactiver' : 'Activer'}
                          >
                            <PowerOff className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CLASS_OPTIONS.map((cls) => (
          <div key={cls} className="flex items-start gap-2 text-xs text-muted-foreground">
            <span className={`mt-0.5 px-1.5 py-0.5 rounded text-xs font-bold ${CLASS_COLORS[cls]}`}>
              {cls}
            </span>
            <span>{CLASS_LABELS[cls].split('—')[1].trim()}</span>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Modifier le compte' : 'Nouveau compte'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="acc-number">Numéro *</Label>
                <Input
                  id="acc-number"
                  value={form.number}
                  onChange={(e) => setForm((p) => ({ ...p, number: e.target.value }))}
                  placeholder="411"
                  maxLength={10}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="acc-class">Classe *</Label>
                <Select
                  value={form.class}
                  onValueChange={(v) => setForm((p) => ({ ...p, class: v as AccountClass }))}
                >
                  <SelectTrigger id="acc-class">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASS_OPTIONS.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        Classe {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="acc-label">Intitulé *</Label>
              <Input
                id="acc-label"
                value={form.label}
                onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                placeholder="Clients"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="acc-type">Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm((p) => ({ ...p, type: v as AccountType }))}
              >
                <SelectTrigger id="acc-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ACCOUNT_TYPE_LABELS) as AccountType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {ACCOUNT_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="acc-active"
                checked={form.is_active}
                onCheckedChange={(v) => setForm((p) => ({ ...p, is_active: v }))}
              />
              <Label htmlFor="acc-active" className="cursor-pointer">Compte actif</Label>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              <X className="w-4 h-4 mr-1" /> Annuler
            </Button>
            <Button onClick={handleSave}>
              <Check className="w-4 h-4 mr-1" /> Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
