'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useTranslations } from 'next-intl'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import {
  Building2,
  Users,
  Settings,
  Palette,
  Mail,
  Plus,
  Edit,
  Save,
  X,
  UserPlus,
  Crown,
  Shield,
  Dumbbell,
  Trash2,
  RefreshCw,
  Clock
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

export default function OrganizationsPage() {
  const router = useRouter()
  const { currentOrganization, organizations, user } = useOrganization()
  const t = useTranslations('Organizations')
  const [editingOrg, setEditingOrg] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState({ name: '', description: '' })
  const [savingOrg, setSavingOrg] = useState<string | null>(null)
  const [members, setMembers] = useState<any[]>([])
  const [invites, setInvites] = useState<any[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [loadingInvites, setLoadingInvites] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null)
  const [inviteToRevoke, setInviteToRevoke] = useState<string | null>(null)

  const getCurrentUserRole = (orgId: string) => {
    return organizations.find(org => org.id === orgId)?.role || 'ATHLETE'
  }

  const currentUserRole = currentOrganization ? getCurrentUserRole(currentOrganization.id) : null

  // Fetch members
  const fetchMembers = async () => {
    if (!currentOrganization) return
    setLoadingMembers(true)
    try {
      const response = await fetch(`/api/organizations/${currentOrganization.id}/members`)
      if (response.ok) {
        const data = await response.json()
        setMembers(data.members || [])
      } else {
        toast.error(t('failedToLoadMembers'))
      }
    } catch (error) {
      console.error('Failed to fetch members:', error)
      toast.error(t('failedToLoadMembers'))
    } finally {
      setLoadingMembers(false)
    }
  }

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
        toast.error(t('failedToLoadInvites'))
      }
    } catch (error) {
      console.error('Failed to fetch invites:', error)
      toast.error(t('failedToLoadInvites'))
    } finally {
      setLoadingInvites(false)
    }
  }

  // Revoke an invite
  const confirmRevokeInvite = async () => {
    if (!currentOrganization || !inviteToRevoke) return
    try {
      const response = await fetch(`/api/organizations/${currentOrganization.id}/invites/${inviteToRevoke}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        toast.success(t('inviteRevoked'))
        fetchInvites()
      } else {
        toast.error(t('failedToRevokeInvite'))
      }
    } catch (error) {
      console.error('Failed to revoke invite:', error)
      toast.error(t('failedToRevokeInvite'))
    } finally {
      setInviteToRevoke(null)
    }
  }

  // Remove a member
  const confirmRemoveMember = async () => {
    if (!currentOrganization || !memberToRemove) return
    try {
      const response = await fetch(`/api/organizations/${currentOrganization.id}/members/${memberToRemove}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        toast.success(t('memberRemoved'))
        fetchMembers()
      } else {
        toast.error(t('failedToRemoveMember'))
      }
    } catch (error) {
      console.error('Failed to remove member:', error)
      toast.error(t('failedToRemoveMember'))
    } finally {
      setMemberToRemove(null)
    }
  }

  useEffect(() => {
    if (currentOrganization && (currentUserRole === 'OWNER' || currentUserRole === 'TRAINER')) {
      fetchMembers()
      fetchInvites()
    }
  }, [currentOrganization?.id, currentUserRole])

  const handleEditOrg = (org: any) => {
    setEditingOrg(org.id)
    setEditFormData({
      name: org.name,
      description: org.description || ''
    })
  }

  const handleSaveOrg = async (orgId: string) => {
    setSavingOrg(orgId)
    try {
      const response = await fetch(`/api/organizations/${orgId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      })

      if (response.ok) {
        setEditingOrg(null)
        // Refresh organizations
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to update organization:', error)
    } finally {
      setSavingOrg(null)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <Crown className="h-4 w-4" />
      case 'TRAINER':
        return <Shield className="h-4 w-4" />
      case 'ATHLETE':
        return <Dumbbell className="h-4 w-4" />
      default:
        return null
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'default'
      case 'TRAINER':
        return 'secondary'
      case 'ATHLETE':
        return 'outline'
      default:
        return 'outline'
    }
  }

  if (!currentOrganization) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">
          {t('title')}
        </h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">
              {t('noOrganizationSelected')}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              {t('createOrJoinPrompt')}
            </p>
            <Button onClick={() => router.push('/dashboard/organizations/setup')}>
              {t('getStarted')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('manageTitle')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('manageDescription')}
        </p>
      </div>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">
            {t('currentOrganization')}
          </TabsTrigger>
          <TabsTrigger value="all">
            {t('allOrganizations')}
          </TabsTrigger>
          {(currentUserRole === 'OWNER' || currentUserRole === 'TRAINER') && (
            <>
              <TabsTrigger value="members">
                {t('members')}
              </TabsTrigger>
              <TabsTrigger value="invites">
                {t('invitations')}
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{currentOrganization.name}</CardTitle>
                    {currentOrganization.description && (
                      <CardDescription className="mt-1">
                        {currentOrganization.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
                <Badge variant={getRoleBadgeVariant(currentUserRole || '')}>
                  <span className="mr-1">{getRoleIcon(currentUserRole || '')}</span>
                  {currentUserRole ? t(`role.${currentUserRole}`) : ''}
                </Badge>
              </div>
            </CardHeader>
            {currentUserRole === 'OWNER' && (
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <Button
                    variant="outline"
                    onClick={() => handleEditOrg(currentOrganization)}
                    className="w-full sm:w-auto"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {t('editInformation')}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    disabled
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    {t('customizeTheme')} {t('comingSoon')}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {editingOrg === currentOrganization.id && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {t('editOrganization')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">
                    {t('organizationName')}
                  </Label>
                  <Input
                    id="edit-name"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    disabled={savingOrg === currentOrganization.id}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">
                    {t('organizationDescription')}
                  </Label>
                  <Textarea
                    id="edit-description"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    rows={4}
                    disabled={savingOrg === currentOrganization.id}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSaveOrg(currentOrganization.id)}
                    disabled={savingOrg === currentOrganization.id}
                  >
                    {savingOrg === currentOrganization.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t('saving')}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {t('save')}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingOrg(null)}
                    disabled={savingOrg === currentOrganization.id}
                  >
                    <X className="h-4 w-4 mr-2" />
                    {t('cancel')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {organizations.map((org) => (
              <Card key={org.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-secondary/50 flex items-center justify-center">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{org.name}</CardTitle>
                        {org.description && (
                          <CardDescription className="mt-1 text-sm">
                            {org.description}
                          </CardDescription>
                        )}
                        {org.joinedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {t('joined')}{' '}
                            {formatDistanceToNow(new Date(org.joinedAt), { addSuffix: true })}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant={getRoleBadgeVariant(org.role || '')}>
                      <span className="mr-1">{getRoleIcon(org.role || '')}</span>
                      {org.role ? t(`role.${org.role}`) : ''}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          <Button
            onClick={() => router.push('/dashboard/organizations/new')}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('createNewOrganization')}
          </Button>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          {currentUserRole === 'OWNER' || currentUserRole === 'TRAINER' ? (
            <Card className="bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t('members')}</CardTitle>
                    <CardDescription>
                      {t('manageMembers')} ({members.length} {t('total')})
                    </CardDescription>
                  </div>
                  <Button onClick={() => router.push('/dashboard/organizations/invite')}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    {t('invite')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingMembers ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : members.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">{t('noMembersYet')}</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('name')}</TableHead>
                        <TableHead>{t('email')}</TableHead>
                        <TableHead>{t('roleLabel')}</TableHead>
                        <TableHead>{t('joined')}</TableHead>
                        <TableHead className="w-[100px]">{t('actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">
                            {member.user?.name || member.user?.email?.split('@')[0] || 'Unknown'}
                          </TableCell>
                          <TableCell>{member.user?.email}</TableCell>
                          <TableCell>
                            <Badge variant={member.role === 'OWNER' ? 'destructive' : member.role === 'TRAINER' ? 'default' : 'secondary'}>
                              {t(`role.${member.role}`)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
                          </TableCell>
                          <TableCell>
                            {member.role !== 'OWNER' && member.userId !== user?.id && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setMemberToRemove(member.userId)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white">
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">
                  {t('noPermission')}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="invites" className="space-y-4">
          {currentUserRole === 'OWNER' || currentUserRole === 'TRAINER' ? (
            <Card className="bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t('pendingInvitations')}</CardTitle>
                    <CardDescription>
                      {t('manageSentInvitations')} ({invites.length} {t('pending')})
                    </CardDescription>
                  </div>
                  <Button onClick={() => router.push('/dashboard/organizations/invite')}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    {t('sendInvite')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingInvites ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : invites.length === 0 ? (
                  <div className="text-center py-8">
                    <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">{t('noInvitesYet')}</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('email')}</TableHead>
                        <TableHead>{t('roleLabel')}</TableHead>
                        <TableHead>{t('sentAt')}</TableHead>
                        <TableHead>{t('expires')}</TableHead>
                        <TableHead className="w-[100px]">{t('actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invites.map((invite) => (
                        <TableRow key={invite.id}>
                          <TableCell className="font-medium">{invite.email}</TableCell>
                          <TableCell>
                            <Badge variant={invite.role === 'OWNER' ? 'destructive' : invite.role === 'TRAINER' ? 'default' : 'secondary'}>
                              {t(`role.${invite.role}`)}
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
          ) : (
            <Card className="bg-white">
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">
                  {t('noPermission')}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Confirm Remove Member Dialog */}
      <AlertDialog open={!!memberToRemove} onOpenChange={(open) => { if (!open) setMemberToRemove(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmRemoveMember')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmRemoveMemberDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveMember}>
              {t('remove')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Revoke Invite Dialog */}
      <AlertDialog open={!!inviteToRevoke} onOpenChange={(open) => { if (!open) setInviteToRevoke(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmRevokeInvite')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmRevokeInviteDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRevokeInvite}>
              {t('revoke')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}