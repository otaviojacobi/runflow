'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Activity,
  Users,
  Calendar,
  TrendingUp,
  ArrowRight,
  Bell,
  Plus,
  FileText,
  Target,
  Dumbbell
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user, currentOrganization, organizations, pendingInvites, loading } = useOrganization()
  const t = useTranslations('Dashboard')
  const tOrg = useTranslations('Organizations')

  // Check if we need to redirect
  const shouldRedirect = !loading && (
    (pendingInvites.length > 0 && !currentOrganization) ||
    (organizations.length === 0 && pendingInvites.length === 0)
  )

  useEffect(() => {
    // If user has pending invites but no organization, redirect to setup
    if (!loading && pendingInvites.length > 0 && !currentOrganization) {
      router.push('/dashboard/invites')
    } else if (!loading && organizations.length === 0 && pendingInvites.length === 0) {
      // No organizations and no invites, go to setup
      router.push('/dashboard/organizations/setup')
    }
  }, [loading, pendingInvites, currentOrganization, organizations, router])

  // Show loading state while checking or if we're going to redirect
  if (loading || shouldRedirect) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">{t('loading')}</p>
        </div>
      </div>
    )
  }

  const userRole = currentOrganization ?
    organizations.find(org => org.id === currentOrganization.id)?.role || 'ATHLETE' :
    'ATHLETE'

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('welcomeBack')}, {user?.name || user?.email?.split('@')[0]}!
        </h1>
        <p className="text-muted-foreground mt-2">
          {currentOrganization ? (
            <>
              {t('currentlyViewing')} <span className="font-semibold">{currentOrganization.name}</span> {t('asRole', { role: tOrg(`role.${userRole}`) })}
            </>
          ) : (
            t('selectOrganization')
          )}
        </p>
      </div>

      {/* Pending Invites Alert */}
      {pendingInvites.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-lg">{t('pendingInvitationsAlert')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {t('invitedToOrganizations', { count: pendingInvites.length })}
            </p>
            <Button onClick={() => router.push('/dashboard/invites')}>
              {t('viewInvitations')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions - Different for roles */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {userRole === 'OWNER' || userRole === 'TRAINER' ? (
          <>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/trainings')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('quickActions.createTraining')}</CardTitle>
                <Dumbbell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{t('trainingSheets')}</div>
                <p className="text-xs text-muted-foreground">{t('quickActions.designSheets')}</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/athletes')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('quickActions.teamManagement')}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{t('athletes')}</div>
                <p className="text-xs text-muted-foreground">{t('quickActions.manageTeam')}</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/organizations/invite')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('invitations')}</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{t('quickActions.manageInvites')}</div>
                <p className="text-xs text-muted-foreground">{t('quickActions.sendTrackInvites')}</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/analytics')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('quickActions.teamAnalytics')}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{t('quickActions.performance')}</div>
                <p className="text-xs text-muted-foreground">{t('quickActions.trackProgress')}</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/my-trainings')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('quickActions.todaysTraining')}</CardTitle>
                <Dumbbell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{t('quickActions.programs')}</div>
                <p className="text-xs text-muted-foreground">{t('quickActions.accessTraining')}</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/schedule')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('quickActions.todaysTraining')}</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{t('schedule')}</div>
                <p className="text-xs text-muted-foreground">{t('quickActions.viewPlan')}</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/progress')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('quickActions.myProgress')}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{t('analytics')}</div>
                <p className="text-xs text-muted-foreground">{t('quickActions.trackPerformance')}</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/achievements')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('quickActions.achievements')}</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{t('quickActions.goals')}</div>
                <p className="text-xs text-muted-foreground">{t('quickActions.viewMilestones')}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Main Content - Only show when there's an organization */}
      {currentOrganization && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
            <TabsTrigger value="activity">{t('tabs.recentActivity')}</TabsTrigger>
            {(userRole === 'OWNER' || userRole === 'TRAINER') && (
              <TabsTrigger value="team">{t('tabs.team')}</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {userRole === 'OWNER' || userRole === 'TRAINER' ? (
              // Owner/Trainer Overview - Focus on org management
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('overview.organizationStats')}</CardTitle>
                    <CardDescription>{t('overview.teamOverview')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{t('overview.totalMembers')}</span>
                        <span className="font-semibold">0</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{t('overview.activeAthletes')}</span>
                        <span className="font-semibold">0</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{t('overview.pendingInvites')}</span>
                        <span className="font-semibold">0</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('overview.trainingPrograms')}</CardTitle>
                    <CardDescription>{t('overview.activeSheets')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">{t('overview.noProgramsYet')}</p>
                      <Button size="sm" className="mt-3" onClick={() => router.push('/dashboard/training/new')}>
                        {t('overview.createFirstProgram')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('overview.teamActivity')}</CardTitle>
                    <CardDescription>{t('overview.recentUpdates')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">{t('overview.noTeamActivity')}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              // Athlete Overview - Focus on personal training
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('overview.thisWeeksTraining')}</CardTitle>
                    <CardDescription>{t('overview.upcomingSessions')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">{t('overview.noSessionsScheduled')}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('overview.recentAchievements')}</CardTitle>
                    <CardDescription>{t('overview.latestMilestones')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">{t('overview.startTrainingForAchievements')}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('overview.trainingStats')}</CardTitle>
                    <CardDescription>{t('overview.monthOverview')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">{t('overview.noTrainingData')}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('tabs.recentActivity')}</CardTitle>
                <CardDescription>{t('overview.latestTrainingUpdates')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">{t('overview.noRecentActivity')}</p>
                  <p className="text-xs mt-2">{t('overview.activitiesWillAppear')}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {(userRole === 'OWNER' || userRole === 'TRAINER') && (
            <TabsContent value="team" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('overview.teamOverviewTitle')}</CardTitle>
                  <CardDescription>{t('overview.manageAthletesTrainers')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">{t('overview.noTeamMembers')}</p>
                      <Button
                        className="mt-4"
                        onClick={() => router.push('/dashboard/athletes/invite')}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {t('overview.inviteTeamMembers')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  )
}