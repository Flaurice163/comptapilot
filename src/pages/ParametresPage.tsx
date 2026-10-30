import { Settings, Database, Info, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/store/useStore'
import { demoAccounts, demoJournalEntries, demoCompany } from '@/data/demoData'

export default function ParametresPage() {
  const { accounts, journalEntries, company } = useStore()

  const handleResetDemo = () => {
    if (window.confirm('Réinitialiser les données de démonstration ? Vos modifications seront perdues.')) {
      const store = useStore.getState()
      store.updateCompany(demoCompany)
      // Reset accounts and journal via direct state manipulation
      useStore.setState({
        accounts: demoAccounts,
        journalEntries: demoJournalEntries,
      })
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Paramètres</h2>
        <p className="text-muted-foreground mt-1">Configuration de l'application</p>
      </div>

      {/* App info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-base">À propos de ComptaPilot</CardTitle>
              <CardDescription>Informations sur l'application</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: 'Version', value: '1.0.0 — MVP Phase 1' },
              { label: 'Plan comptable', value: 'PCG 2005 Madagascar' },
              { label: 'Devise par défaut', value: 'MGA — Ariary (Ar)' },
              { label: 'Environnement', value: 'Démonstration locale' },
            ].map((row) => (
              <div key={row.label} className="flex justify-between py-2 border-b last:border-0">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-medium">{row.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-base">Statistiques des données</CardTitle>
              <CardDescription>Résumé du contenu de votre espace</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Comptes actifs', value: accounts.filter((a) => a.is_active).length, color: 'text-indigo-600' },
              { label: 'Comptes inactifs', value: accounts.filter((a) => !a.is_active).length, color: 'text-muted-foreground' },
              { label: 'Écritures', value: journalEntries.length, color: 'text-green-600' },
              { label: 'Lignes d\'écriture', value: journalEntries.reduce((s, e) => s + (e.lines?.length ?? 0), 0), color: 'text-blue-600' },
              { label: 'Journaux utilisés', value: new Set(journalEntries.map((e) => e.journal)).size, color: 'text-orange-600' },
              { label: 'Périodes couvertes', value: new Set(journalEntries.map((e) => e.date.substring(0, 7))).size + ' mois', color: 'text-purple-600' },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-3 rounded-lg bg-muted/30">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Features roadmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Fonctionnalités disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {[
              { name: 'Authentification', status: 'done' },
              { name: 'Gestion de l\'entreprise', status: 'done' },
              { name: 'Plan comptable (PCG 2005)', status: 'done' },
              { name: 'Journal comptable', status: 'done' },
              { name: 'Grand livre automatique', status: 'done' },
              { name: 'Balance automatique', status: 'done' },
              { name: 'Compte de résultat', status: 'done' },
              { name: 'Bilan simplifié', status: 'done' },
              { name: 'Dashboard & KPI', status: 'done' },
              { name: 'Analyse de rentabilité', status: 'done' },
              { name: 'Clients & Fournisseurs', status: 'planned' },
              { name: 'Facturation', status: 'planned' },
              { name: 'Gestion des stocks', status: 'planned' },
              { name: 'Comptabilité analytique', status: 'planned' },
              { name: 'Export PDF / Excel', status: 'planned' },
              { name: 'Assistant IA', status: 'future' },
            ].map((feature) => (
              <div key={feature.name} className="flex items-center justify-between py-1.5 border-b last:border-0">
                <span className={feature.status === 'done' ? 'font-medium' : 'text-muted-foreground'}>
                  {feature.name}
                </span>
                <Badge
                  variant={
                    feature.status === 'done'
                      ? 'success'
                      : feature.status === 'planned'
                      ? 'warning'
                      : 'secondary'
                  }
                >
                  {feature.status === 'done' ? 'Phase 1' : feature.status === 'planned' ? 'Phase 2-3' : 'Phase 5'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reset demo */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="text-base text-orange-700 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Réinitialisation
          </CardTitle>
          <CardDescription>Restaurer les données de démonstration initiales</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Cette action réinitialise le plan comptable et les écritures avec les données de démonstration.
            Vos modifications seront perdues.
          </p>
          <Button variant="warning" onClick={handleResetDemo} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Réinitialiser les données démo
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
