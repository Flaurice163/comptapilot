import { useState } from 'react'
import { Building2, Save, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useStore } from '@/store/useStore'

export default function EntreprisePage() {
  const { company, updateCompany } = useStore()
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    name: company?.name ?? '',
    address: company?.address ?? '',
    phone: company?.phone ?? '',
    email: company?.email ?? '',
    nif: company?.nif ?? '',
    stat: company?.stat ?? '',
    created_date: company?.created_date ?? '',
    currency: company?.currency ?? 'MGA',
  })

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    updateCompany(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Informations de l'entreprise</h2>
          <p className="text-muted-foreground mt-1">
            Gérez les informations générales de votre entreprise.
          </p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          {saved ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Enregistré
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Enregistrer
            </>
          )}
        </Button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          Les informations ont été enregistrées avec succès.
        </div>
      )}

      {/* Identité */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-base">Identité</CardTitle>
              <CardDescription>Informations principales de l'entreprise</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="name">Nom de l'entreprise *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="SOAMAMY SARL"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="created_date">Date de création</Label>
              <Input
                id="created_date"
                type="date"
                value={form.created_date}
                onChange={(e) => handleChange('created_date', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Devise de référence</Label>
              <Input
                id="currency"
                value="MGA — Ariary (Ar)"
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Les montants sont affichés en Ariary (Ar) avec deux décimales.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Coordonnées</CardTitle>
          <CardDescription>Adresse et contacts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Lot 15 Rue du Commerce, Toamasina 501, Madagascar"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+261 20 XX XXX XX"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="contact@entreprise.mg"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Identifiants fiscaux */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identifiants fiscaux</CardTitle>
          <CardDescription>NIF, STAT — nécessaires pour les documents officiels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nif">NIF (Numéro d'Identification Fiscale)</Label>
              <Input
                id="nif"
                value={form.nif}
                onChange={(e) => handleChange('nif', e.target.value)}
                placeholder="1234567890"
                maxLength={20}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stat">STAT (Numéro statistique)</Label>
              <Input
                id="stat"
                value={form.stat}
                onChange={(e) => handleChange('stat', e.target.value)}
                placeholder="12345/67/2019/01234"
                maxLength={30}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notice */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-4">
          <p className="text-sm text-orange-700">
            <strong>Important :</strong> ComptaPilot est un outil de gestion comptable à usage interne.
            Il n'est pas officiellement certifié ni reconnu comme logiciel conforme aux obligations fiscales
            malgaches. Consultez votre expert-comptable ou l'Administration fiscale pour toute obligation légale.
          </p>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg" className="gap-2">
          <Save className="w-4 h-4" />
          Enregistrer les modifications
        </Button>
      </div>
    </div>
  )
}
