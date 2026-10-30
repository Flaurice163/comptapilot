import { useState } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useStore } from '@/store/useStore'

export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(false)
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const register = useStore((s) => s.register)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await register(email, password, fullName, companyName)
    setLoading(false)
    if (result.success) setSubmitted(true)
    else setError(result.error ?? 'Impossible de créer le compte.')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500 mb-4">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">ComptaPilot</h1>
          <p className="text-indigo-300 mt-1">Créer votre espace de gestion</p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Inscription</CardTitle>
            <CardDescription>Créez votre compte pour commencer</CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Compte créé !</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Un e-mail de confirmation a été envoyé à <strong>{email}</strong>.
                  Cliquez sur le lien pour confirmer votre adresse et accéder au tableau de bord.
                </p>
                <Link to="/login">
                  <Button className="w-full">Aller à la connexion</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullname">Nom complet</Label>
                  <Input
                    id="fullname"
                    placeholder="Votre nom et prénom"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Nom de l'entreprise</Label>
                  <Input
                    id="company"
                    placeholder="Ma Société SARL"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Adresse e-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="vous@exemple.mg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimum 8 caractères"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    minLength={8}
                  />
                </div>

                {error && (
                  <div className="rounded-md bg-destructive/10 text-destructive text-sm px-3 py-2 border border-destructive/20">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Création du compte…' : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Créer mon compte
                    </>
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Déjà un compte ?{' '}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Se connecter
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
