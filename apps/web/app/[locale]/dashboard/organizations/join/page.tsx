'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, ArrowLeft } from 'lucide-react'
import { useOrganization } from '@/contexts/OrganizationContext'

export default function JoinOrganizationPage() {
  const router = useRouter()
  const t = useTranslations('Organizations')
  const { acceptInvite, refreshOrganizations } = useOrganization()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [inviteCode, setInviteCode] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Extract token from invite code (could be full URL or just token)
      let token = inviteCode.trim()
      if (token.includes('/')) {
        // Extract token from URL
        const parts = token.split('/')
        token = parts[parts.length - 1]!
      }

      await acceptInvite(token)
      await refreshOrganizations()
      router.push('/dashboard')
    } catch (err) {
      setError(t('invalidInviteCode'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className="border-gray-300 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('joinOrganization')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('useProvidedCode')}
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary/50 flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <CardTitle>
                  {t('inviteCode')}
                </CardTitle>
                <CardDescription>
                  {t('inviteCodeHint')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">
                {t('inviteCodeLabel')}
              </Label>
              <Input
                id="inviteCode"
                type="text"
                placeholder={t('inviteCodePlaceholder')}
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                required
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                {t('inviteCodeHint')}
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              type="button"
              variant="cancel"
              onClick={() => router.back()}
              disabled={loading}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading || !inviteCode.trim()}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('joining')}
                </>
              ) : (
                t('joinOrganization')
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card className="border-muted">
        <CardHeader>
          <CardTitle className="text-lg">
            {t('dontHaveCode')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {t('dontHaveCodeDescription')}
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                {t('askCoach')}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                {t('createOwn')}
              </span>
            </li>
          </ul>
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => router.push('/dashboard/organizations/new')}
          >
            {t('createMyOwnOrganization')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}