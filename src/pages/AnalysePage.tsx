import { useMemo, useState } from 'react'
import { BarChart3, TrendingUp, Target, Calculator } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useStore } from '@/store/useStore'
import { computeGrandLivre, computeCompteResultat, computeMonthlySeries } from '@/lib/accounting'
import { formatNumber, formatCurrency } from '@/lib/utils'

export default function AnalysePage() {
  const { accounts, journalEntries } = useStore()

  const [simPrix, setSimPrix] = useState('10000')
  const [simPrixNouveau, setSimPrixNouveau] = useState('11000')
  const [simQte, setSimQte] = useState('1000')

  const gl = useMemo(
    () => computeGrandLivre(journalEntries, accounts),
    [journalEntries, accounts],
  )

  const cr = useMemo(() => computeCompteResultat(gl), [gl])

  const monthlySeries = useMemo(
    () => computeMonthlySeries(journalEntries, accounts),
    [journalEntries, accounts],
  )

  // Approximation coûts fixes/variables basée sur nature des comptes
  const coutsFixes = useMemo(() => {
    const fixedAccounts = ['613', '641', '645', '616', '626', '627', '681']
    return gl
      .filter((g) => fixedAccounts.includes(g.account.number))
      .reduce((s, g) => s + (g.total_debit - g.total_credit), 0)
  }, [gl])

  const coutsVariables = Math.max(0, cr.total_charges - coutsFixes)
  const marge = cr.resultat
  const tauxMarge = cr.total_produits > 0 ? (cr.resultat / cr.total_produits) * 100 : 0
  const seuilRentabilite = coutsVariables < cr.total_produits
    ? (coutsFixes / (1 - coutsVariables / cr.total_produits))
    : 0

  // Simulation
  const prixActuel = parseFloat(simPrix) || 0
  const prixNouveau = parseFloat(simPrixNouveau) || 0
  const quantite = parseFloat(simQte) || 0
  const caActuel = prixActuel * quantite
  const caNouveau = prixNouveau * quantite
  const impactCA = caNouveau - caActuel
  const tauxImpact = caActuel > 0 ? (impactCA / caActuel) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Analyse de rentabilité</h2>
        <p className="text-muted-foreground mt-1">
          Synthèse financière et simulation de prix
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Chiffre d\'affaires', value: formatCurrency(cr.total_produits), icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Coûts variables', value: formatCurrency(coutsVariables), icon: BarChart3, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Coûts fixes', value: formatCurrency(coutsFixes), icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Marge', value: `${tauxMarge.toFixed(1)} %`, icon: Calculator, color: marge >= 0 ? 'text-green-600' : 'text-red-600', bg: marge >= 0 ? 'bg-green-50' : 'bg-red-50' },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className={`text-xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${kpi.bg}`}>
                  <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Seuil de rentabilité */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Seuil de rentabilité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">Coûts fixes</p>
              <p className="text-xl font-bold mt-1">{formatNumber(coutsFixes)} Ar</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-indigo-50">
              <p className="text-xs text-muted-foreground">Seuil de rentabilité</p>
              <p className="text-xl font-bold mt-1 text-primary">
                {seuilRentabilite > 0 ? formatNumber(seuilRentabilite) : 'N/A'} Ar
              </p>
              <p className="text-xs text-muted-foreground mt-1">CA minimum pour couvrir les charges</p>
            </div>
            <div className={`text-center p-4 rounded-lg ${cr.total_produits >= seuilRentabilite && seuilRentabilite > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="text-xs text-muted-foreground">CA actuel vs seuil</p>
              <p className={`text-xl font-bold mt-1 ${cr.total_produits >= seuilRentabilite && seuilRentabilite > 0 ? 'text-green-700' : 'text-red-700'}`}>
                {cr.total_produits >= seuilRentabilite && seuilRentabilite > 0 ? 'Atteint' : 'Non atteint'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{formatNumber(cr.total_produits)} Ar réalisés</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Évolution mensuelle */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Évolution mensuelle — CA, Charges & Résultat</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlySeries}>
              <defs>
                <linearGradient id="gradCA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradCharges" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value: number) => [`${formatNumber(value)} Ar`]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="ca" name="Produits" stroke="#22c55e" fill="url(#gradCA)" strokeWidth={2} />
              <Area type="monotone" dataKey="charges" name="Charges" stroke="#f97316" fill="url(#gradCharges)" strokeWidth={2} />
              <Area type="monotone" dataKey="resultat" name="Résultat" stroke="#6366f1" fill="none" strokeWidth={2} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Simulation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="w-4 h-4 text-primary" />
            Simulation de prix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Inputs */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Prix actuel (Ar)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={simPrix}
                    onChange={(e) => setSimPrix(e.target.value)}
                    placeholder="10 000"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Nouveau prix (Ar)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={simPrixNouveau}
                    onChange={(e) => setSimPrixNouveau(e.target.value)}
                    placeholder="11 000"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Quantité vendue</Label>
                <Input
                  type="number"
                  min="0"
                  value={simQte}
                  onChange={(e) => setSimQte(e.target.value)}
                  placeholder="1 000"
                />
              </div>
            </div>

            {/* Results */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">Impact estimé</h4>
              <div className="space-y-2">
                {[
                  { label: 'CA actuel', value: formatNumber(caActuel) + ' Ar', color: 'text-foreground' },
                  { label: 'Nouveau CA', value: formatNumber(caNouveau) + ' Ar', color: 'text-indigo-700' },
                  {
                    label: 'Variation CA',
                    value: `${impactCA >= 0 ? '+' : ''}${formatNumber(impactCA)} Ar (${tauxImpact.toFixed(1)} %)`,
                    color: impactCA >= 0 ? 'text-green-600' : 'text-red-600',
                  },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center py-2 border-b last:border-0">
                    <span className="text-sm text-muted-foreground">{row.label}</span>
                    <span className={`font-semibold text-sm ${row.color}`}>{row.value}</span>
                  </div>
                ))}
              </div>
              {impactCA !== 0 && (
                <div className={`p-3 rounded-lg text-sm text-center font-medium ${
                  impactCA > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {impactCA > 0
                    ? `Une hausse de ${formatNumber(prixNouveau - prixActuel)} Ar par unité génère +${formatNumber(impactCA)} Ar de CA supplémentaire.`
                    : `Une baisse de ${formatNumber(prixActuel - prixNouveau)} Ar par unité réduit le CA de ${formatNumber(Math.abs(impactCA))} Ar.`
                  }
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
