import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, TrendingUp, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useStore } from '@/store/useStore'

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState(() =>
    new URLSearchParams(window.location.search).get('authError') === 'recovery'
      ? 'Le lien de récupération est invalide ou expiré. Demandez-en un nouveau.'
      : '',
  )
  const [loading, setLoading] = useState(false)
  const requestPasswordReset = useStore((s) => s.requestPasswordReset)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await requestPasswordReset(email)
    setLoading(false)
    if (result.success) setSubmitted(true)
    else setError(result.error ?? 'Impossible d’envoyer le lien de récupération.')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500 mb-4">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">ComptaPilot</h1>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Récupération du mot de passe</CardTitle>
            <CardDescription>Entrez votre e-mail pour recevoir un lien de réinitialisation</CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">E-mail envoyé</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Si un compte existe pour <strong>{email}</strong>, vous recevrez un e-mail de réinitialisation.
                </p>
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour à la connexion
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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

                {error && (
                  <div className="rounded-md bg-destructive/10 text-destructive text-sm px-3 py-2 border border-destructive/20">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Envoi en cours…' : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Envoyer le lien
                    </>
                  )}
                </Button>

                <Link to="/login">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour à la connexion
                  </Button>
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
