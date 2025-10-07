'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ArrowLeft, UserPlus, Copy, Check, Trash2, RefreshCw, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

export default function InviteUsersPage() {
  const router = useRouter()
  const { currentOrganization } = useOrganization()
  const t = useTranslations('Organizations.Invite')
  const tCommon = useTranslations('Organizations')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'TRAINER' | 'ATHLETE'>('ATHLETE')
  const [sending, setSending] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [invites, setInvites] = useState<any[]>([])
  const [loadingInvites, setLoadingInvites] = useState(false)
  const [inviteToRevoke, setInviteToRevoke] = useState<string | null>(null)

  // Fetch invites
  const fetchInvites = async () => {
    if (!currentOrganization) return
    setLoadingInvites(true)
    try {
      const response = await fetch(`/api/organizations/${currentOrganization.id}/invites`)
      if (response.ok) {
        const data = await response.json()
        setInvites(Array.isArray(data) ? data : [])
      } else {
        toast.error(tCommon('failedToLoadInvites'))
      }
    } catch (error) {
      console.error('Failed to fetch invites:', error)
      toast.error(tCommon('failedToLoadInvites'))
    } finally {
      setLoadingInvites(false)
    }
  }

  useEffect(() => {
    if (currentOrganization) {
      fetchInvites()
    }
  }, [currentOrganization?.id])

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
        body: JSON.stringify({ email, role })
      })

      if (response.ok) {
        const data = await response.json()
        setInviteCode(data.inviteCode)
        toast.success(t('inviteSent'))
        setEmail('')
        fetchInvites() // Refresh the list
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

  const confirmRevokeInvite = async () => {
    if (!currentOrganization || !inviteToRevoke) return
    try {
      const response = await fetch(`/api/organizations/${currentOrganization.id}/invites/${inviteToRevoke}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        toast.success(tCommon('inviteRevoked'))
        fetchInvites()
      } else {
        toast.error(tCommon('failedToRevokeInvite'))
      }
    } catch (error) {
      console.error('Failed to revoke invite:', error)
      toast.error(tCommon('failedToRevokeInvite'))
    } finally {
      setInviteToRevoke(null)
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">{t('roleLabel')}</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as 'TRAINER' | 'ATHLETE')}
                disabled={sending}
              >
                <SelectTrigger id="role" className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="ATHLETE">
                    {tCommon('role.ATHLETE')}
                  </SelectItem>
                  <SelectItem value="TRAINER">
                    {tCommon('role.TRAINER')}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t('roleDescription')}
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

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>{tCommon('pendingInvitations')}</CardTitle>
          <CardDescription>
            {tCommon('manageSentInvitations')} ({invites.length} {tCommon('pending')})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingInvites ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : invites.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">{tCommon('noInvitesYet')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tCommon('email')}</TableHead>
                  <TableHead>{tCommon('roleLabel')}</TableHead>
                  <TableHead>{tCommon('sentAt')}</TableHead>
                  <TableHead>{tCommon('expires')}</TableHead>
                  <TableHead className="w-[100px]">{tCommon('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell className="font-medium">{invite.email}</TableCell>
                    <TableCell>
                      <Badge variant={invite.role === 'OWNER' ? 'destructive' : invite.role === 'TRAINER' ? 'default' : 'secondary'}>
                        {tCommon(`role.${invite.role}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(invite.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(invite.expiresAt), { addSuffix: true })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setInviteToRevoke(invite.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Confirm Revoke Invite Dialog */}
      <AlertDialog open={!!inviteToRevoke} onOpenChange={(open) => { if (!open) setInviteToRevoke(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tCommon('confirmRevokeInvite')}</AlertDialogTitle>
            <AlertDialogDescription>
              {tCommon('confirmRevokeInviteDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRevokeInvite}>
              {tCommon('revoke')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
