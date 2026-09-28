import { useMemo, useState } from 'react'
import { Landmark, CheckCircle2, AlertTriangle, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useStore } from '@/store/useStore'
import { computeGrandLivre, computeBilan } from '@/lib/accounting'
import { formatNumber } from '@/lib/utils'

interface BilanSectionProps {
  title: string
  items: Array<{ account_number: string; account_label: string; amount: number }>
  total: number
  colorClass: string
  headerColor: string
}

function BilanSection({ title, items, total, colorClass, headerColor }: BilanSectionProps) {
  return (
    <div>
      <div className={`px-4 py-2 rounded-t-lg font-semibold text-sm ${headerColor}`}>
        {title}
      </div>
      <div className="rounded-b-lg border border-t-0 overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-3 text-center text-muted-foreground text-xs">
                  Aucun mouvement
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.account_number} className="border-b last:border-0 hover:bg-muted/5">
                  <td className="px-4 py-2">
                    <span className="font-mono text-xs text-primary font-semibold mr-2">
                      {item.account_number}
                    </span>
                    <span className="text-xs text-muted-foreground">{item.account_label}</span>
                  </td>
                  <td className={`px-4 py-2 text-right font-semibold ${colorClass}`}>
                    {formatNumber(item.amount)} Ar
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr className={`border-t ${headerColor}`}>
              <td className="px-4 py-2.5 font-bold">Sous-total</td>
              <td className={`px-4 py-2.5 text-right font-bold ${colorClass}`}>
                {formatNumber(total)} Ar
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

export default function BilanPage() {
  const { accounts, journalEntries } = useStore()
  const [filterStart, setFilterStart] = useState('')
  const [filterEnd, setFilterEnd] = useState('')

  const period = filterStart && filterEnd ? { start: filterStart, end: filterEnd } : undefined

  const gl = useMemo(
    () => computeGrandLivre(journalEntries, accounts, period),
    [journalEntries, accounts, period],
  )

  const bilan = useMemo(() => computeBilan(gl), [gl])

  const actifImmob = bilan.actif.immobilisations.reduce((s, i) => s + i.amount, 0)
  const actifStocks = bilan.actif.stocks.reduce((s, i) => s + i.amount, 0)
  const actifCreances = bilan.actif.creances.reduce((s, i) => s + i.amount, 0)
  const actifTreso = bilan.actif.tresorerie.reduce((s, i) => s + i.amount, 0)
  const passifCapitaux = bilan.passif.capitaux.reduce((s, i) => s + i.amount, 0)
  const passifDettes = bilan.passif.dettes.reduce((s, i) => s + i.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Bilan</h2>
          <p className="text-muted-foreground mt-1">Bilan simplifié — calculé depuis les écritures</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
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

      {/* Balance indicator */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
        bilan.is_balanced
          ? 'bg-green-50 border-green-200 text-green-700'
          : 'bg-orange-50 border-orange-200 text-orange-700'
      }`}>
        {bilan.is_balanced ? (
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
        ) : (
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        )}
        <div>
          <p className="font-medium">
            {bilan.is_balanced
              ? 'Bilan équilibré — Total Actif = Total Passif'
              : 'Attention : Le bilan n\'est pas équilibré'}
          </p>
          <p className="text-sm opacity-80">
            Actif : {formatNumber(bilan.actif.total)} Ar —
            Passif : {formatNumber(bilan.passif.total)} Ar
          </p>
        </div>
      </div>

      {/* Bilan grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ACTIF */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-blue-700">
              <Landmark className="w-4 h-4" />
              ACTIF
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <BilanSection
              title="Immobilisations"
              items={bilan.actif.immobilisations}
              total={actifImmob}
              colorClass="text-blue-700"
              headerColor="bg-blue-50 text-blue-800"
            />
            <BilanSection
              title="Stocks"
              items={bilan.actif.stocks}
              total={actifStocks}
              colorClass="text-cyan-700"
              headerColor="bg-cyan-50 text-cyan-800"
            />
            <BilanSection
              title="Créances"
              items={bilan.actif.creances}
              total={actifCreances}
              colorClass="text-indigo-700"
              headerColor="bg-indigo-50 text-indigo-800"
            />
            <BilanSection
              title="Trésorerie"
              items={bilan.actif.tresorerie}
              total={actifTreso}
              colorClass="text-green-700"
              headerColor="bg-green-50 text-green-800"
            />

            {/* Total Actif */}
            <div className="flex justify-between items-center px-4 py-3 bg-blue-700 text-white rounded-lg font-bold text-base mt-2">
              <span>TOTAL ACTIF</span>
              <span>{formatNumber(bilan.actif.total)} Ar</span>
            </div>
          </CardContent>
        </Card>

        {/* PASSIF */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-purple-700">
              <Landmark className="w-4 h-4" />
              PASSIF
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <BilanSection
              title="Capitaux propres"
              items={bilan.passif.capitaux}
              total={passifCapitaux}
              colorClass="text-purple-700"
              headerColor="bg-purple-50 text-purple-800"
            />
            <BilanSection
              title="Dettes"
              items={bilan.passif.dettes}
              total={passifDettes}
              colorClass="text-orange-700"
              headerColor="bg-orange-50 text-orange-800"
            />

            {/* Résultat */}
            <div>
              <div className={`px-4 py-2 rounded-t-lg font-semibold text-sm ${bilan.passif.resultat >= 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                Résultat de l'exercice
              </div>
              <div className="rounded-b-lg border border-t-0">
                <div className="flex justify-between px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    {bilan.passif.resultat >= 0 ? 'Bénéfice' : 'Déficit'}
                  </span>
                  <span className={`font-bold ${bilan.passif.resultat >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {bilan.passif.resultat >= 0 ? '+' : ''}{formatNumber(bilan.passif.resultat)} Ar
                  </span>
                </div>
              </div>
            </div>

            {/* Total Passif */}
            <div className="flex justify-between items-center px-4 py-3 bg-purple-700 text-white rounded-lg font-bold text-base mt-2">
              <span>TOTAL PASSIF</span>
              <span>{formatNumber(bilan.passif.total)} Ar</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vérification finale */}
      <Card className="border-2 border-primary/20">
        <CardContent className="pt-5">
          <div className="max-w-lg mx-auto">
            <h3 className="font-semibold text-center mb-4">Vérification de l'équilibre du bilan</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-blue-50">
                <p className="text-xs text-muted-foreground mb-1">Total Actif</p>
                <p className="text-xl font-bold text-blue-700">{formatNumber(bilan.actif.total)} Ar</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-purple-50">
                <p className="text-xs text-muted-foreground mb-1">Total Passif</p>
                <p className="text-xl font-bold text-purple-700">{formatNumber(bilan.passif.total)} Ar</p>
              </div>
            </div>
            <div className={`mt-4 text-center py-3 rounded-lg font-medium ${
              bilan.is_balanced ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {bilan.is_balanced ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Actif = Passif — Bilan équilibré
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Différence : {formatNumber(Math.abs(bilan.actif.total - bilan.passif.total))} Ar
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
