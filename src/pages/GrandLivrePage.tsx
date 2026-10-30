import { useState, useMemo } from 'react'
import { Library, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useStore } from '@/store/useStore'
import { computeGrandLivre } from '@/lib/accounting'
import { formatDate, formatNumber, isBalanced } from '@/lib/utils'
import type { AccountClass } from '@/types'
import { CLASS_LABELS } from '@/types'

export default function GrandLivrePage() {
  const { accounts, journalEntries } = useStore()

  const [filterAccount, setFilterAccount] = useState<string>('all')
  const [filterClass, setFilterClass] = useState<AccountClass | 'all'>('all')
  const [filterStart, setFilterStart] = useState('')
  const [filterEnd, setFilterEnd] = useState('')
  const [search, setSearch] = useState('')

  const period = filterStart && filterEnd
    ? { start: filterStart, end: filterEnd }
    : undefined

  const gl = useMemo(
    () => computeGrandLivre(journalEntries, accounts, period),
    [journalEntries, accounts, period],
  )

  const filtered = useMemo(() => {
    return gl.filter((g) => {
      if (filterAccount !== 'all' && g.account.number !== filterAccount) return false
      if (filterClass !== 'all' && g.account.class !== filterClass) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          g.account.number.toLowerCase().includes(q) ||
          g.account.label.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [gl, filterAccount, filterClass, search])

  const totals = useMemo(
    () => ({
      debit: filtered.reduce((s, g) => s + g.total_debit, 0),
      credit: filtered.reduce((s, g) => s + g.total_credit, 0),
    }),
    [filtered],
  )

  const CLASS_OPTIONS: AccountClass[] = ['1', '2', '3', '4', '5', '6', '7']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Grand livre</h2>
        <p className="text-muted-foreground mt-1">
          Généré automatiquement à partir des écritures du journal
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un compte…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterAccount} onValueChange={setFilterAccount}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les comptes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les comptes</SelectItem>
                {accounts
                  .filter((a) => a.is_active)
                  .sort((a, b) => a.number.localeCompare(b.number))
                  .map((a) => (
                    <SelectItem key={a.id} value={a.number}>
                      {a.number} — {a.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Select
              value={filterClass}
              onValueChange={(v) => setFilterClass(v as AccountClass | 'all')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes les classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les classes</SelectItem>
                {CLASS_OPTIONS.map((cls) => (
                  <SelectItem key={cls} value={cls}>Classe {cls}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2 items-center">
              <Label className="text-xs whitespace-nowrap">Du</Label>
              <Input type="date" value={filterStart} onChange={(e) => setFilterStart(e.target.value)} className="flex-1" />
              <Label className="text-xs whitespace-nowrap">Au</Label>
              <Input type="date" value={filterEnd} onChange={(e) => setFilterEnd(e.target.value)} className="flex-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary totals */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Total Débit</p>
            <p className="text-xl font-bold text-foreground mt-1">{formatNumber(totals.debit)} Ar</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Total Crédit</p>
            <p className="text-xl font-bold text-foreground mt-1">{formatNumber(totals.credit)} Ar</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Solde net</p>
            <p className={`text-xl font-bold mt-1 ${isBalanced(totals.debit, totals.credit) ? 'text-green-600' : 'text-orange-600'}`}>
              {formatNumber(totals.debit - totals.credit)} Ar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grand livre accounts */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Aucun compte avec des mouvements trouvé
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((glAccount) => (
            <Card key={glAccount.account.id}>
              <CardHeader className="pb-0 pt-4 px-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Library className="w-4 h-4 text-primary" />
                    <span className="font-mono font-bold text-primary text-base">
                      {glAccount.account.number}
                    </span>
                    <span className="font-semibold text-foreground">
                      {glAccount.account.label}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {CLASS_LABELS[glAccount.account.class].split('—')[0].trim()}
                  </Badge>
                  {glAccount.rows.length > 0 && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {glAccount.rows.length} mouvement{glAccount.rows.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0 mt-2">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-y bg-muted/20">
                        <th className="text-left px-4 py-2 font-medium text-muted-foreground">Date</th>
                        <th className="text-left px-4 py-2 font-medium text-muted-foreground hidden sm:table-cell">Référence</th>
                        <th className="text-left px-4 py-2 font-medium text-muted-foreground">Libellé</th>
                        <th className="text-right px-4 py-2 font-medium text-muted-foreground">Débit</th>
                        <th className="text-right px-4 py-2 font-medium text-muted-foreground">Crédit</th>
                        <th className="text-right px-4 py-2 font-medium text-muted-foreground">Solde</th>
                      </tr>
                    </thead>
                    <tbody>
                      {glAccount.rows.map((row, idx) => (
                        <tr
                          key={`${row.entry_id}-${idx}`}
                          className={`border-b last:border-0 hover:bg-muted/10 ${idx % 2 === 0 ? '' : 'bg-muted/5'}`}
                        >
                          <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">
                            {formatDate(row.date)}
                          </td>
                          <td className="px-4 py-2 font-mono text-xs hidden sm:table-cell">
                            {row.reference}
                          </td>
                          <td className="px-4 py-2 max-w-[200px] truncate">{row.label}</td>
                          <td className="px-4 py-2 text-right">
                            {row.debit > 0 ? (
                              <span className="text-blue-700 font-medium">{formatNumber(row.debit)}</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {row.credit > 0 ? (
                              <span className="text-orange-700 font-medium">{formatNumber(row.credit)}</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-right font-semibold">
                            <span className={row.balance >= 0 ? 'text-foreground' : 'text-red-600'}>
                              {formatNumber(row.balance)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/30 border-t font-semibold text-sm">
                        <td colSpan={3} className="px-4 py-2.5 text-muted-foreground">
                          Total
                        </td>
                        <td className="px-4 py-2.5 text-right text-blue-700">
                          {formatNumber(glAccount.total_debit)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-orange-700">
                          {formatNumber(glAccount.total_credit)}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <span className={`font-bold ${glAccount.balance >= 0 ? 'text-foreground' : 'text-red-600'}`}>
                            {formatNumber(glAccount.balance)}
                          </span>
                          {glAccount.balance > 0 && <span className="text-xs text-muted-foreground ml-1">D</span>}
                          {glAccount.balance < 0 && <span className="text-xs text-muted-foreground ml-1">C</span>}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
