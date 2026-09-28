import { useMemo, useState } from 'react'
import { Scale, CheckCircle2, AlertTriangle, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useStore } from '@/store/useStore'
import { computeGrandLivre, computeBalance } from '@/lib/accounting'
import { formatNumber } from '@/lib/utils'
import type { AccountClass } from '@/types'
import { CLASS_LABELS } from '@/types'

const CLASS_OPTIONS: AccountClass[] = ['1', '2', '3', '4', '5', '6', '7']

const CLASS_BG: Record<AccountClass, string> = {
  '1': 'bg-purple-50',
  '2': 'bg-blue-50',
  '3': 'bg-cyan-50',
  '4': 'bg-orange-50',
  '5': 'bg-green-50',
  '6': 'bg-red-50',
  '7': 'bg-emerald-50',
}

export default function BalancePage() {
  const { accounts, journalEntries } = useStore()
  const [filterClass, setFilterClass] = useState<AccountClass | 'all'>('all')
  const [filterStart, setFilterStart] = useState('')
  const [filterEnd, setFilterEnd] = useState('')

  const period = filterStart && filterEnd ? { start: filterStart, end: filterEnd } : undefined

  const gl = useMemo(
    () => computeGrandLivre(journalEntries, accounts, period),
    [journalEntries, accounts, period],
  )

  const balance = useMemo(() => computeBalance(gl), [gl])

  const filtered = useMemo(() => {
    if (filterClass === 'all') return balance
    return balance.filter((r) => r.account_class === filterClass)
  }, [balance, filterClass])

  const totals = useMemo(
    () => ({
      debit: filtered.reduce((s, r) => s + r.total_debit, 0),
      credit: filtered.reduce((s, r) => s + r.total_credit, 0),
      solde_debiteur: filtered.reduce((s, r) => s + r.solde_debiteur, 0),
      solde_crediteur: filtered.reduce((s, r) => s + r.solde_crediteur, 0),
    }),
    [filtered],
  )

  const globalTotals = useMemo(
    () => ({
      debit: balance.reduce((s, r) => s + r.total_debit, 0),
      credit: balance.reduce((s, r) => s + r.total_credit, 0),
    }),
    [balance],
  )

  const isGlobalBalanced = Math.abs(globalTotals.debit - globalTotals.credit) < 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Balance générale</h2>
          <p className="text-muted-foreground mt-1">
            Générée automatiquement depuis le grand livre
          </p>
        </div>
        <Button variant="outline" className="gap-2 sm:self-start" onClick={() => window.print()}>
          <Download className="w-4 h-4" />
          Exporter
        </Button>
      </div>

      {/* Balance status */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
        isGlobalBalanced
          ? 'bg-green-50 border-green-200 text-green-700'
          : 'bg-red-50 border-red-200 text-red-700'
      }`}>
        {isGlobalBalanced ? (
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
        ) : (
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        )}
        <div>
          <p className="font-medium">
            {isGlobalBalanced
              ? 'Balance équilibrée — Total débit = Total crédit'
              : 'Attention : La balance n\'est pas équilibrée'}
          </p>
          <p className="text-sm opacity-80">
            Total débit : {formatNumber(globalTotals.debit)} Ar —
            Total crédit : {formatNumber(globalTotals.credit)} Ar
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3">
            <Select
              value={filterClass}
              onValueChange={(v) => setFilterClass(v as AccountClass | 'all')}
            >
              <SelectTrigger className="w-[200px]">
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
              <Input type="date" value={filterStart} onChange={(e) => setFilterStart(e.target.value)} className="w-36" />
              <Label className="text-xs whitespace-nowrap">Au</Label>
              <Input type="date" value={filterEnd} onChange={(e) => setFilterEnd(e.target.value)} className="w-36" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balance table */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-base flex items-center gap-2">
            <Scale className="w-4 h-4 text-muted-foreground" />
            {filtered.length} compte{filtered.length !== 1 ? 's' : ''}
            {filterClass !== 'all' && ` — ${CLASS_LABELS[filterClass]}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground w-24">N° Compte</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Intitulé</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Total Débit</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Total Crédit</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Solde Débiteur</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Solde Créditeur</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                      Aucune donnée pour cette sélection
                    </td>
                  </tr>
                ) : (
                  (() => {
                    let lastClass: AccountClass | null = null
                    return filtered.map((row, idx) => {
                      const showClassHeader = row.account_class !== lastClass
                      lastClass = row.account_class
                      return (
                        <>
                          {showClassHeader && (
                            <tr key={`class-${row.account_class}`} className={CLASS_BG[row.account_class]}>
                              <td
                                colSpan={6}
                                className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b"
                              >
                                {CLASS_LABELS[row.account_class]}
                              </td>
                            </tr>
                          )}
                          <tr
                            key={row.account_number}
                            className={`border-b last:border-0 hover:bg-muted/20 ${idx % 2 === 0 ? '' : 'bg-muted/5'}`}
                          >
                            <td className="px-4 py-2.5 font-mono font-semibold text-primary">
                              {row.account_number}
                            </td>
                            <td className="px-4 py-2.5">{row.account_label}</td>
                            <td className="px-4 py-2.5 text-right">
                              {row.total_debit > 0 ? (
                                <span className="text-blue-700 font-medium">{formatNumber(row.total_debit)}</span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              {row.total_credit > 0 ? (
                                <span className="text-orange-700 font-medium">{formatNumber(row.total_credit)}</span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              {row.solde_debiteur > 0 ? (
                                <span className="font-semibold text-blue-700">{formatNumber(row.solde_debiteur)}</span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              {row.solde_crediteur > 0 ? (
                                <span className="font-semibold text-orange-700">{formatNumber(row.solde_crediteur)}</span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                          </tr>
                        </>
                      )
                    })
                  })()
                )}
              </tbody>
              <tfoot>
                <tr className="bg-muted/40 border-t-2 font-bold text-sm">
                  <td colSpan={2} className="px-4 py-3 text-foreground">
                    TOTAL GÉNÉRAL
                  </td>
                  <td className="px-4 py-3 text-right text-blue-700">
                    {formatNumber(totals.debit)} Ar
                  </td>
                  <td className="px-4 py-3 text-right text-orange-700">
                    {formatNumber(totals.credit)} Ar
                  </td>
                  <td className="px-4 py-3 text-right text-blue-700">
                    {formatNumber(totals.solde_debiteur)} Ar
                  </td>
                  <td className="px-4 py-3 text-right text-orange-700">
                    {formatNumber(totals.solde_crediteur)} Ar
                  </td>
                </tr>
                {/* Vérification équilibre */}
                <tr className={`text-sm ${Math.abs(totals.debit - totals.credit) < 1 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <td colSpan={6} className="px-4 py-2 text-center">
                    {Math.abs(totals.debit - totals.credit) < 1 ? (
                      <span className="text-green-700 flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Total débit = Total crédit
                      </span>
                    ) : (
                      <span className="text-red-700 flex items-center justify-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Déséquilibre de {formatNumber(Math.abs(totals.debit - totals.credit))} Ar
                      </span>
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
