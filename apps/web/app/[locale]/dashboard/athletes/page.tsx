'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { Users, UserPlus, Search, MoreVertical, Mail, Calendar, Activity, RefreshCw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AthletesPage() {
  const router = useRouter()
  const { currentOrganization } = useOrganization()
  const t = useTranslations('Athletes')
  const tCommon = useTranslations('Organizations')
  const [searchQuery, setSearchQuery] = useState('')
  const [athletes, setAthletes] = useState<any[]>([])
  const [loadingAthletes, setLoadingAthletes] = useState(false)
  const [athleteToRemove, setAthleteToRemove] = useState<{ id: string; name: string } | null>(null)

  // Fetch athletes (members with ATHLETE role)
  const fetchAthletes = async () => {
    if (!currentOrganization) return
    setLoadingAthletes(true)
    try {
      const response = await fetch(`/api/organizations/${currentOrganization.id}/members`)
      if (response.ok) {
        const data = await response.json()
        // Filter only athletes and add mock data for columns we don't have yet
        const athletesData = (data.members || [])
          .filter((member: any) => member.role === 'ATHLETE')
          .map((member: any) => ({
            id: member.id,
            userId: member.userId,
            name: member.user?.name || member.user?.email?.split('@')[0] || 'Unknown',
            email: member.user?.email,
            status: 'active', // Mock - will be replaced later
            joinedAt: new Date(member.joinedAt),
            lastActivity: new Date(), // Mock - will be replaced later
            sessionsCompleted: Math.floor(Math.random() * 50) // Mock - will be replaced later
          }))
        setAthletes(athletesData)
      } else {
        toast.error(tCommon('failedToLoadMembers'))
      }
    } catch (error) {
      console.error('Failed to fetch athletes:', error)
      toast.error(tCommon('failedToLoadMembers'))
    } finally {
      setLoadingAthletes(false)
    }
  }

  useEffect(() => {
    if (currentOrganization) {
      fetchAthletes()
    }
  }, [currentOrganization?.id])

  const confirmRemoveAthlete = async () => {
    if (!currentOrganization || !athleteToRemove) return
    try {
      const response = await fetch(`/api/organizations/${currentOrganization.id}/members/${athleteToRemove.id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        toast.success(tCommon('memberRemoved'))
        fetchAthletes()
      } else {
        toast.error(tCommon('failedToRemoveMember'))
      }
    } catch (error) {
      console.error('Failed to remove athlete:', error)
      toast.error(tCommon('failedToRemoveMember'))
    } finally {
      setAthleteToRemove(null)
    }
  }

  const filteredAthletes = athletes.filter(athlete =>
    athlete.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    athlete.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!currentOrganization) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
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
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('description')}
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/athletes/invite')}>
          <UserPlus className="h-4 w-4 mr-2" />
          {t('inviteAthlete')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('allAthletes')}</CardTitle>
              <CardDescription>
                {t('athleteCount', { count: filteredAthletes.length })}
              </CardDescription>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loadingAthletes ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredAthletes.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">{t('noAthletes')}</p>
              <p className="text-sm text-muted-foreground mb-6">
                {t('noAthletesDescription')}
              </p>
              <Button onClick={() => router.push('/dashboard/athletes/invite')}>
                <UserPlus className="h-4 w-4 mr-2" />
                {t('inviteAthlete')}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.name')}</TableHead>
                  <TableHead>{t('table.email')}</TableHead>
                  <TableHead>{t('table.status')}</TableHead>
                  <TableHead>{t('table.sessions')}</TableHead>
                  <TableHead>{t('table.lastActivity')}</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAthletes.map((athlete) => (
                  <TableRow key={athlete.id}>
                    <TableCell className="font-medium">{athlete.name}</TableCell>
                    <TableCell>{athlete.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={athlete.status === 'active' ? 'default' : 'secondary'}
                      >
                        {t(`status.${athlete.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        {athlete.sessionsCompleted}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {athlete.lastActivity.toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{t('actions.title')}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            {t('actions.viewProfile')}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            {t('actions.viewProgress')}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            {t('actions.sendMessage')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setAthleteToRemove({ id: athlete.userId, name: athlete.name })}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('actions.remove')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Confirm Remove Athlete Dialog */}
      <AlertDialog open={!!athleteToRemove} onOpenChange={(open) => { if (!open) setAthleteToRemove(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmRemoveAthlete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmRemoveAthleteDescription', { name: athleteToRemove?.name || '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveAthlete}>
              {t('actions.remove')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
