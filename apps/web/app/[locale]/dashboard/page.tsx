'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOrganization } from '@/contexts/OrganizationContext'
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
  Target
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user, currentOrganization, organizations, pendingInvites, loading } = useOrganization()

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
          <p className="mt-4 text-gray-500">Loading...</p>
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
          Welcome back, {user?.name || user?.email?.split('@')[0]}!
        </h1>
        <p className="text-muted-foreground mt-2">
          {currentOrganization ? (
            <>
              You're currently viewing <span className="font-semibold">{currentOrganization.name}</span> as {userRole.toLowerCase()}
            </>
          ) : (
            'Select an organization to get started'
          )}
        </p>
      </div>

      {/* Pending Invites Alert */}
      {pendingInvites.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-lg">You have pending invitations</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You've been invited to join {pendingInvites.length} organization{pendingInvites.length > 1 ? 's' : ''}.
            </p>
            <Button onClick={() => router.push('/dashboard/invites')}>
              View Invitations
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions - Different for roles */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {userRole === 'OWNER' || userRole === 'TRAINER' ? (
          <>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/athletes')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Management</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Athletes</div>
                <p className="text-xs text-muted-foreground">Manage your team members</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/training/new')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Create Training</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">New Program</div>
                <p className="text-xs text-muted-foreground">Design training sheets</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/organizations/invite')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Invitations</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Manage Invites</div>
                <p className="text-xs text-muted-foreground">Send and track invitations</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/analytics')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Analytics</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Performance</div>
                <p className="text-xs text-muted-foreground">Track team progress</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/schedule')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Training</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Schedule</div>
                <p className="text-xs text-muted-foreground">View your training plan</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/training')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Training Sheets</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Programs</div>
                <p className="text-xs text-muted-foreground">Access your training</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/progress')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Analytics</div>
                <p className="text-xs text-muted-foreground">Track your performance</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/achievements')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Achievements</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Goals</div>
                <p className="text-xs text-muted-foreground">View your milestones</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Main Content - Only show when there's an organization */}
      {currentOrganization && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            {(userRole === 'OWNER' || userRole === 'TRAINER') && (
              <TabsTrigger value="team">Team</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {userRole === 'OWNER' || userRole === 'TRAINER' ? (
              // Owner/Trainer Overview - Focus on org management
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Organization Stats</CardTitle>
                    <CardDescription>Team overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Members</span>
                        <span className="font-semibold">0</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Active Athletes</span>
                        <span className="font-semibold">0</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Pending Invites</span>
                        <span className="font-semibold">0</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Training Programs</CardTitle>
                    <CardDescription>Active sheets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">No training programs created yet</p>
                      <Button size="sm" className="mt-3" onClick={() => router.push('/dashboard/training/new')}>
                        Create First Program
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Team Activity</CardTitle>
                    <CardDescription>Recent updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">No recent team activity</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              // Athlete Overview - Focus on personal training
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>This Week's Training</CardTitle>
                    <CardDescription>Your upcoming sessions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">No training sessions scheduled yet</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Achievements</CardTitle>
                    <CardDescription>Your latest milestones</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">Start training to earn achievements</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Training Stats</CardTitle>
                    <CardDescription>This month's overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">No training data yet</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest training updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No recent activity</p>
                  <p className="text-xs mt-2">Your training activities will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {(userRole === 'OWNER' || userRole === 'TRAINER') && (
            <TabsContent value="team" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Team Overview</CardTitle>
                  <CardDescription>Manage your athletes and trainers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">No team members yet</p>
                      <Button
                        className="mt-4"
                        onClick={() => router.push('/dashboard/athletes/invite')}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Invite Team Members
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