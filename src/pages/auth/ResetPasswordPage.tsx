import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LockKeyhole, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useStore } from '@/store/useStore'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const updatePassword = useStore((state) => state.updatePassword)
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (password !== confirmation) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    const result = await updatePassword(password)
    setLoading(false)
    if (result.success) navigate('/dashboard', { replace: true })
    else setError(result.error ?? 'Impossible de modifier le mot de passe.')
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
          <CardHeader>
            <CardTitle className="text-xl">Nouveau mot de passe</CardTitle>
            <CardDescription>Choisissez un nouveau mot de passe pour votre compte.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmation">Confirmer le mot de passe</Label>
                <Input
                  id="confirmation"
                  type="password"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
              {error && (
                <div className="rounded-md bg-destructive/10 text-destructive text-sm px-3 py-2 border border-destructive/20">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                <LockKeyhole className="w-4 h-4 mr-2" />
                {loading ? 'Modification…' : 'Modifier le mot de passe'}
              </Button>
              <Link to="/login" className="block text-center text-sm text-primary hover:underline">
                Retour à la connexion
              </Link>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
