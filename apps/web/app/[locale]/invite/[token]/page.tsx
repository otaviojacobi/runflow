'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Flag, UserPlus, Clock, AlertCircle, CheckCircle, Mail } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface InviteData {
  invite: {
    id: string
    organizationId: string
    email: string
    role: string
    status: string
    expiresAt: string
    createdAt: string
  }
  organization: {
    id: string
    name: string
    slug: string
    description: string | null
    logo: string | null
  }
  invitedBy: {
    name: string | null
    email: string
  }
}

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter()
  const t = useTranslations('Organizations')
  const tAuth = useTranslations('Auth.login')
  const [token, setToken] = useState<string | null>(null)
  const [inviteData, setInviteData] = useState<InviteData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    params.then(({ token }) => setToken(token))
  }, [params])

  useEffect(() => {
    if (!token) return

    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setIsLoggedIn(true)
        setUserEmail(user.email || null)
      }
      setCheckingAuth(false)
    }

    checkAuth()
  }, [token])

  useEffect(() => {
    if (!token) return

    const fetchInvite = async () => {
      try {
        const response = await fetch(`/api/invites/${token}`)
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Failed to load invite')
          return
        }

        setInviteData(data)
      } catch {
        setError('Failed to load invite')
      } finally {
        setLoading(false)
      }
    }

    fetchInvite()
  }, [token])

  const handleAccept = async () => {
    if (!token) return

    setAccepting(true)
    setError(null)

    try {
      const response = await fetch(`/api/invites/${token}/accept`, {
        method: 'POST',
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to accept invite')
        return
      }

      setAccepted(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch {
      setError('Failed to accept invite')
    } finally {
      setAccepting(false)
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'destructive'
      case 'TRAINER':
        return 'default'
      case 'ATHLETE':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const inviteEmail = inviteData?.invite.email || ''
  const emailMatches = userEmail ? userEmail.toLowerCase() === inviteEmail.toLowerCase() : false

  if (loading || checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-blue-50 to-violet-100">
        <div className="text-gray-600">{tAuth('loadingPage')}</div>
      </div>
    )
  }

  if (error && !inviteData) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-violet-100" />

        <header className="relative bg-white/90 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                RunFlow
              </span>
            </Link>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-gray-900 to-transparent" />
        </header>

        <div className="relative flex items-center justify-center px-4 py-12">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl">{t('InvitePage.invalidInvite')}</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Button variant="outline" onClick={() => router.push('/')}>
                {t('InvitePage.backToHome')}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  if (accepted) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-violet-100" />

        <header className="relative bg-white/90 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                RunFlow
              </span>
            </Link>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-gray-900 to-transparent" />
        </header>

        <div className="relative flex items-center justify-center px-4 py-12">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl">{t('InvitePage.inviteAccepted')}</CardTitle>
              <CardDescription>
                {t('InvitePage.nowMemberOf', { organization: inviteData?.organization.name || '' })}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-violet-100">
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-100/60 via-transparent to-violet-200/60 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-blue-100/30 to-purple-200/50 animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      <header className="relative bg-white/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              RunFlow
            </span>
          </Link>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-gray-900 to-transparent" />
      </header>

      <div className="relative flex items-center justify-center px-4 py-12">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-blue-100">
                  <Flag className="h-7 w-7 text-blue-600" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl">{inviteData?.organization.name}</CardTitle>
                {inviteData?.organization.description && (
                  <CardDescription className="mt-1">
                    {inviteData.organization.description}
                  </CardDescription>
                )}
              </div>
              <Badge variant={getRoleBadgeVariant(inviteData?.invite.role || '')}>
                {t(`role.${inviteData?.invite.role}`)}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-blue-900">
                {t('InvitePage.youWereInvited')} <strong>{t(`role.${inviteData?.invite.role}`)}</strong>.
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">{t('InvitePage.sentTo')}:</span>
                <strong className="text-gray-900">{inviteEmail}</strong>
              </div>
            </div>

            {isLoggedIn && !emailMatches && (
              <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    {t('InvitePage.emailMismatch')} ({userEmail})
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                <span>
                  {t('invitedBy')} {inviteData?.invitedBy.name || inviteData?.invitedBy.email}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  {t('expiresIn')} {inviteData?.invite.expiresAt && formatDistanceToNow(new Date(inviteData.invite.expiresAt), { addSuffix: true })}
                </span>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            {isLoggedIn ? (
              <Button
                className="w-full"
                onClick={handleAccept}
                disabled={accepting || !emailMatches}
              >
                {accepting ? t('accepting') : t('acceptInvite')}
              </Button>
            ) : (
              <>
                <p className="text-sm text-center text-muted-foreground">
                  {t('InvitePage.loginOrRegister')}
                </p>
                <div className="flex gap-2 w-full">
                  <Button
                    className="flex-1"
                    onClick={() => router.push(`/login?redirect=/invite/${token}&email=${encodeURIComponent(inviteEmail)}`)}
                  >
                    {tAuth('submitButton')}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push(`/register?redirect=/invite/${token}&email=${encodeURIComponent(inviteEmail)}`)}
                  >
                    {t('InvitePage.createAccount')}
                  </Button>
                </div>
              </>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
