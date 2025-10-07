'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOrganization } from '@/contexts/OrganizationContext'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Building2, Clock, UserPlus, X, Check } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function PendingInvitesPage() {
  const router = useRouter()
  const { pendingInvites, acceptInvite, declineInvite, refreshOrganizations } = useOrganization()
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({})

  const handleAccept = async (token: string, inviteId: string) => {
    setLoadingStates(prev => ({ ...prev, [inviteId]: true }))
    try {
      await acceptInvite(token)
      await refreshOrganizations()
      // If this was the last invite, redirect to dashboard
      if (pendingInvites.length === 1) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Failed to accept invite:', error)
    } finally {
      setLoadingStates(prev => ({ ...prev, [inviteId]: false }))
    }
  }

  const handleDecline = async (inviteId: string) => {
    setLoadingStates(prev => ({ ...prev, [`decline-${inviteId}`]: true }))
    try {
      await declineInvite(inviteId)
      // If this was the last invite, redirect to organization setup
      if (pendingInvites.length === 1) {
        router.push('/dashboard/organizations/setup')
      }
    } catch (error) {
      console.error('Failed to decline invite:', error)
    } finally {
      setLoadingStates(prev => ({ ...prev, [`decline-${inviteId}`]: false }))
    }
  }

  const handleSkip = () => {
    router.push('/dashboard/organizations/setup')
  }

  if (pendingInvites.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>No Pending Invitations</CardTitle>
            <CardDescription>
              You don't have any pending organization invitations at the moment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Would you like to create your own organization or wait for an invitation?
            </p>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button onClick={() => router.push('/dashboard/organizations/new')}>
              Create Organization
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pending Invitations</h1>
        <p className="text-muted-foreground mt-2">
          You have been invited to join the following organizations. Accept or decline each invitation below.
        </p>
      </div>

      <div className="grid gap-4">
        {pendingInvites.map((invite) => (
          <Card key={invite.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      <Building2 className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{invite.organization.name}</CardTitle>
                    {invite.organization.description && (
                      <CardDescription className="mt-1">
                        {invite.organization.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
                <Badge variant={getRoleBadgeVariant(invite.role)}>
                  {invite.role}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span>
                    Invited by {invite.invitedBy.name || invite.invitedBy.email}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    Expires {formatDistanceToNow(new Date(invite.expiresAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                onClick={() => handleAccept(invite.token, invite.id)}
                disabled={loadingStates[invite.id] || loadingStates[`decline-${invite.id}`]}
              >
                {loadingStates[invite.id] ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Accepting...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Accept Invitation
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDecline(invite.id)}
                disabled={loadingStates[invite.id] || loadingStates[`decline-${invite.id}`]}
              >
                {loadingStates[`decline-${invite.id}`] ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground mr-2"></div>
                    Declining...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Decline
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="flex justify-center pt-4">
        <Button variant="ghost" onClick={handleSkip}>
          Skip for now - I'll create my own organization
        </Button>
      </div>
    </div>
  )
}