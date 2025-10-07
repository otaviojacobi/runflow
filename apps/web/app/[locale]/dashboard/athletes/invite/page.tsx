'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, UserPlus, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

export default function InviteAthletePage() {
  const router = useRouter()
  const { currentOrganization } = useOrganization()
  const t = useTranslations('Athletes.Invite')
  const tCommon = useTranslations('Organizations')
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !currentOrganization) {
      return
    }

    setSending(true)
    try {
      const response = await fetch(`/api/organizations/${currentOrganization.id}/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: 'ATHLETE' })
      })

      if (response.ok) {
        const data = await response.json()
        setInviteCode(data.inviteCode)
        toast.success(t('inviteSent'))
        setEmail('')
      } else {
        const error = await response.json()
        toast.error(error.message || t('inviteError'))
      }
    } catch (error) {
      console.error('Failed to send invite:', error)
      toast.error(t('inviteError'))
    } finally {
      setSending(false)
    }
  }

  const handleCopyCode = () => {
    if (inviteCode) {
      const inviteUrl = `${window.location.origin}/dashboard/organizations/join?code=${inviteCode}`
      navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      toast.success(t('linkCopied'))
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!currentOrganization) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium mb-2">
              {tCommon('noOrganizationSelected')}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              {tCommon('createOrJoinPrompt')}
            </p>
            <Button onClick={() => router.push('/dashboard/organizations/setup')}>
              {tCommon('getStarted')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
            {t('title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('description')}
          </p>
        </div>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>{t('sendInvitation')}</CardTitle>
          <CardDescription>
            {t('inviteByEmail')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendInvite} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('emailAddress')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={sending}
                required
                className="bg-white"
              />
              <p className="text-xs text-muted-foreground">
                {t('emailHint')}
              </p>
            </div>

            <Button type="submit" disabled={sending} className="w-full sm:w-auto">
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('sending')}
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {t('sendInvite')}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {inviteCode && (
        <Card className="bg-white border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle>{t('invitationSent')}</CardTitle>
            <CardDescription>
              {t('shareLink')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                value={`${window.location.origin}/dashboard/organizations/join?code=${inviteCode}`}
                readOnly
                className="font-mono text-sm bg-white"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyCode}
                className="bg-white"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('linkInfo')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
