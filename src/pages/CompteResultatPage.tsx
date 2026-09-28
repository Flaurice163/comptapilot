import { useMemo, useState } from 'react'
import {
  TrendingUp, TrendingDown, BarChart3, Download,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useStore } from '@/store/useStore'
import { computeGrandLivre, computeCompteResultat } from '@/lib/accounting'
import { formatNumber } from '@/lib/utils'

export default function CompteResultatPage() {
  const { accounts, journalEntries } = useStore()
  const [filterStart, setFilterStart] = useState('')
  const [filterEnd, setFilterEnd] = useState('')

  const period = filterStart && filterEnd ? { start: filterStart, end: filterEnd } : undefined

  const gl = useMemo(
    () => computeGrandLivre(journalEntries, accounts, period),
    [journalEntries, accounts, period],
  )

  const cr = useMemo(() => computeCompteResultat(gl), [gl])

  const isProfit = cr.resultat >= 0
  const tauxMarge = cr.total_produits > 0
    ? ((cr.resultat / cr.total_produits) * 100).toFixed(1)
    : '0.0'

  const chartData = [
    { name: 'Produits', value: cr.total_produits, fill: '#22c55e' },
    { name: 'Charges', value: cr.total_charges, fill: '#f97316' },
    { name: 'Résultat', value: Math.abs(cr.resultat), fill: isProfit ? '#6366f1' : '#ef4444' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Compte de résultat</h2>
          <p className="text-muted-foreground mt-1">Calculé automatiquement depuis les écritures</p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-2 items-center">
            <Label className="text-xs whitespace-nowrap">Du</Label>
            <Input type="date" value={filterStart} onChange={(e) => setFilterStart(e.target.value)} className="w-36" />
            <Label className="text-xs whitespace-nowrap">Au</Label>
            <Input type="date" value={filterEnd} onChange={(e) => setFilterEnd(e.target.value)} className="w-36" />
          </div>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-1" /> Exporter
          </Button>
        </div>
      </div>

      {/* Résultat highlight */}
      <Card className={`border-2 ${isProfit ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              {isProfit ? (
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              )}
              <div>
                <p className={`text-sm font-medium ${isProfit ? 'text-green-700' : 'text-red-700'}`}>
                  {isProfit ? 'Résultat bénéficiaire' : 'Résultat déficitaire'}
                </p>
                <p className={`text-3xl font-bold ${isProfit ? 'text-green-700' : 'text-red-700'}`}>
                  {isProfit ? '+' : ''}{formatNumber(cr.resultat)} Ar
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Produits</p>
                <p className="font-bold text-green-700">{formatNumber(cr.total_produits)} Ar</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Charges</p>
                <p className="font-bold text-orange-700">{formatNumber(cr.total_charges)} Ar</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Taux de marge</p>
                <p className={`font-bold ${isProfit ? 'text-green-700' : 'text-red-700'}`}>
                  {tauxMarge} %
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              Produits vs Charges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number) => [`${formatNumber(value)} Ar`]}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Produits */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-green-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Produits
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-green-50">
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Compte</th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">Montant</th>
                </tr>
              </thead>
              <tbody>
                {cr.produits.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-4 py-4 text-center text-muted-foreground text-xs">
                      Aucun produit
                    </td>
                  </tr>
                ) : (
                  cr.produits.map((item) => (
                    <tr key={item.account_number} className="border-b last:border-0 hover:bg-muted/10">
                      <td className="px-4 py-2">
                        <p className="font-mono text-xs text-primary font-semibold">{item.account_number}</p>
                        <p className="text-xs text-muted-foreground leading-tight">{item.account_label}</p>
                      </td>
                      <td className="px-4 py-2 text-right font-semibold text-green-700">
                        {formatNumber(item.amount)} Ar
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-green-50 border-t font-bold">
                  <td className="px-4 py-2.5 text-green-800">Total produits</td>
                  <td className="px-4 py-2.5 text-right text-green-700">
                    {formatNumber(cr.total_produits)} Ar
                  </td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>

        {/* Charges */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-orange-700 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Charges
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-orange-50">
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Compte</th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">Montant</th>
                </tr>
              </thead>
              <tbody>
                {cr.charges.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-4 py-4 text-center text-muted-foreground text-xs">
                      Aucune charge
                    </td>
                  </tr>
                ) : (
                  cr.charges.map((item) => (
                    <tr key={item.account_number} className="border-b last:border-0 hover:bg-muted/10">
                      <td className="px-4 py-2">
                        <p className="font-mono text-xs text-primary font-semibold">{item.account_number}</p>
                        <p className="text-xs text-muted-foreground leading-tight">{item.account_label}</p>
                      </td>
                      <td className="px-4 py-2 text-right font-semibold text-orange-700">
                        {formatNumber(item.amount)} Ar
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-orange-50 border-t font-bold">
                  <td className="px-4 py-2.5 text-orange-800">Total charges</td>
                  <td className="px-4 py-2.5 text-right text-orange-700">
                    {formatNumber(cr.total_charges)} Ar
                  </td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Synthèse finale */}
      <Card className="border-2 border-primary/20">
        <CardContent className="pt-5 pb-5">
          <div className="max-w-md mx-auto space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium text-green-700">Total Produits</span>
              <span className="font-bold text-green-700">{formatNumber(cr.total_produits)} Ar</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium text-orange-700">— Total Charges</span>
              <span className="font-bold text-orange-700">{formatNumber(cr.total_charges)} Ar</span>
            </div>
            <div className={`flex justify-between items-center py-3 rounded-lg px-3 ${
              isProfit ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <span className={`font-bold text-lg ${isProfit ? 'text-green-700' : 'text-red-700'}`}>
                Résultat net
              </span>
              <span className={`font-bold text-xl ${isProfit ? 'text-green-700' : 'text-red-700'}`}>
                {isProfit ? '+' : ''}{formatNumber(cr.resultat)} Ar
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
