import { useMemo } from 'react'
import {
  TrendingUp, TrendingDown, Wallet, Package,
  Users, AlertTriangle, CheckCircle2, Info,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/store/useStore'
import {
  computeGrandLivre, computeKPI, computeMonthlySeries,
} from '@/lib/accounting'
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils'
import type { JournalEntry } from '@/types'

const COLORS = ['#6366f1', '#22c55e', '#f97316', '#ef4444', '#06b6d4', '#a855f7']

function KpiCard({
  title, value, icon: Icon, color, sub,
}: {
  title: string
  value: string
  icon: React.ElementType
  color: string
  sub?: string
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`p-2.5 rounded-lg ${color === 'text-green-600' ? 'bg-green-50' : color === 'text-red-600' ? 'bg-red-50' : color === 'text-blue-600' ? 'bg-blue-50' : 'bg-indigo-50'}`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-medium text-foreground mb-2">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name} : {formatNumber(p.value)} Ar
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const { accounts, journalEntries } = useStore()

  const gl = useMemo(
    () => computeGrandLivre(journalEntries, accounts),
    [journalEntries, accounts],
  )

  const kpi = useMemo(() => computeKPI(gl), [gl])
  const monthlySeries = useMemo(
    () => computeMonthlySeries(journalEntries, accounts),
    [journalEntries, accounts],
  )

  const recentEntries = useMemo(
    () => [...journalEntries]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8),
    [journalEntries],
  )

  // Charges par catégorie pour pie chart
  const chargesData = useMemo(() => {
    return gl
      .filter((g) => g.account.class === '6' && g.total_debit > 0)
      .map((g) => ({
        name: g.account.label.length > 25 ? g.account.label.substring(0, 25) + '…' : g.account.label,
        value: g.total_debit - g.total_credit,
      }))
      .filter((r) => r.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
  }, [gl])

  // Alertes
  const alerts = useMemo(() => {
    const list: Array<{ type: 'warning' | 'error' | 'info'; message: string }> = []
    if (kpi.resultat < 0) {
      list.push({ type: 'error', message: 'Résultat déficitaire — les charges dépassent les produits.' })
    }
    const creances = gl
      .filter((g) => g.account.number.startsWith('41'))
      .reduce((s, g) => s + (g.total_debit - g.total_credit), 0)
    if (creances > 10_000_000) {
      list.push({ type: 'warning', message: `Créances clients élevées : ${formatCurrency(creances)}.` })
    }
    const dettes = gl
      .filter((g) => g.account.number.startsWith('40'))
      .reduce((s, g) => s + (g.total_credit - g.total_debit), 0)
    if (dettes > 5_000_000) {
      list.push({ type: 'info', message: `Dettes fournisseurs en cours : ${formatCurrency(dettes)}.` })
    }
    if (journalEntries.some((e) => !e.is_validated)) {
      list.push({ type: 'warning', message: 'Des écritures non validées sont en attente de confirmation.' })
    }
    return list
  }, [gl, kpi, journalEntries])

  const getJournalBadge = (entry: JournalEntry) => {
    const map: Record<string, string> = {
      VENTES: 'success',
      ACHATS: 'warning',
      BANQUE: 'info',
      CAISSE: 'purple',
      OPERATIONS: 'secondary',
    }
    return (map[entry.journal] ?? 'secondary') as 'success' | 'warning' | 'info' | 'purple' | 'secondary'
  }

  const journalLabels: Record<string, string> = {
    VENTES: 'Ventes',
    ACHATS: 'Achats',
    BANQUE: 'Banque',
    CAISSE: 'Caisse',
    OPERATIONS: 'OD',
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Chiffre d'affaires"
          value={formatCurrency(kpi.chiffre_affaires)}
          icon={TrendingUp}
          color="text-indigo-600"
          sub="Produits cumulés"
        />
        <KpiCard
          title="Total des charges"
          value={formatCurrency(kpi.total_charges)}
          icon={TrendingDown}
          color="text-orange-600"
          sub="Charges cumulées"
        />
        <KpiCard
          title="Résultat"
          value={formatCurrency(kpi.resultat)}
          icon={kpi.resultat >= 0 ? TrendingUp : TrendingDown}
          color={kpi.resultat >= 0 ? 'text-green-600' : 'text-red-600'}
          sub={kpi.resultat >= 0 ? 'Bénéfice' : 'Déficit'}
        />
        <KpiCard
          title="Trésorerie"
          value={formatCurrency(kpi.tresorerie)}
          icon={Wallet}
          color="text-blue-600"
          sub="Banque + Caisse"
        />
      </div>

      {/* Ligne 2 : graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution CA */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Évolution du chiffre d'affaires</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlySeries}>
                <defs>
                  <linearGradient id="caGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="ca"
                  name="CA"
                  stroke="#6366f1"
                  fill="url(#caGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Charges vs Produits */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Charges vs Produits</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlySeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="ca" name="Produits" fill="#22c55e" radius={[3, 3, 0, 0]} />
                <Bar dataKey="charges" name="Charges" fill="#f97316" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Ligne 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Résultat mensuel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Résultat mensuel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlySeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="resultat"
                  name="Résultat"
                  radius={[3, 3, 0, 0]}
                  fill="#6366f1"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition charges */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Répartition des charges</CardTitle>
          </CardHeader>
          <CardContent>
            {chargesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={chargesData}
                    cx="40%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                  >
                    {chargesData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
                Aucune donnée de charges
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ligne 4 : opérations + alertes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dernières opérations */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Dernières opérations</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Date</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Référence</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Libellé</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Journal</th>
                    <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEntries.map((entry, idx) => {
                    const totalDebit = entry.lines?.reduce((s, l) => s + l.debit, 0) ?? 0
                    return (
                      <tr key={entry.id} className={`border-b last:border-0 hover:bg-muted/20 ${idx % 2 === 0 ? '' : 'bg-muted/10'}`}>
                        <td className="px-4 py-2.5 text-muted-foreground">{formatDate(entry.date)}</td>
                        <td className="px-4 py-2.5 font-mono text-xs">{entry.reference}</td>
                        <td className="px-4 py-2.5 max-w-[200px] truncate hidden md:table-cell">{entry.label}</td>
                        <td className="px-4 py-2.5">
                          <Badge variant={getJournalBadge(entry)}>
                            {journalLabels[entry.journal] ?? entry.journal}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5 text-right font-medium">
                          {formatNumber(totalDebit)} Ar
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Alertes */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Alertes</CardTitle>
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.length === 0 ? (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Aucune alerte en cours.</span>
              </div>
            ) : (
              alerts.map((alert, i) => (
                <div
                  key={i}
                  className={`flex gap-2 p-3 rounded-lg text-sm ${
                    alert.type === 'error'
                      ? 'bg-red-50 text-red-700 border border-red-100'
                      : alert.type === 'warning'
                      ? 'bg-orange-50 text-orange-700 border border-orange-100'
                      : 'bg-blue-50 text-blue-700 border border-blue-100'
                  }`}
                >
                  {alert.type === 'error' ? (
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  ) : alert.type === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  )}
                  <span>{alert.message}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
