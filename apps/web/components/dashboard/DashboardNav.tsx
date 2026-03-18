'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Menu,
  X,
  Home,
  Users,
  Settings,
  LogOut,
  UserCircle,
  Flag,
  Bell,
  Dumbbell,
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { OrganizationSwitcher } from '@/components/organization/OrganizationSwitcher'
import { useOrganization } from '@/contexts/OrganizationContext'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'

export function DashboardNav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, currentOrganization, pendingInvites } = useOrganization()
  const t = useTranslations('Dashboard')
  const tOrg = useTranslations('Organizations')
  const tTrainings = useTranslations('Trainings')

  const navigation = [
    {
      name: t('title'),
      href: '/dashboard',
      icon: Home,
      roles: ['OWNER', 'TRAINER', 'ATHLETE']
    },
    {
      name: tTrainings('title'),
      href: '/dashboard/trainings',
      icon: Dumbbell,
      roles: ['OWNER', 'TRAINER']
    },
    {
      name: tTrainings('myTrainingSchedule'),
      href: '/dashboard/my-trainings',
      icon: Calendar,
      roles: ['ATHLETE']
    },
    {
      name: t('athletes'),
      href: '/dashboard/athletes',
      icon: Users,
      roles: ['OWNER', 'TRAINER']
    },
  ]

  const userRole = currentOrganization ?
    (user?.organizations?.find(org => org.id === currentOrganization.id)?.role || 'ATHLETE') :
    'ATHLETE'

  const filteredNavigation = navigation.filter(item =>
    item.roles.includes(userRole)
  )

  const handleLogout = async () => {
    try {
      // Use Supabase client directly for logout
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('Logout error:', error)
      }

      // Always redirect to login page after logout attempt
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Still redirect even if there's an error
      router.push('/login')
    }
  }

  return (
    <>
      <nav className="relative z-50 bg-white/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile menu button */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-white">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Navigate through the application and switch organizations
              </SheetDescription>
              <div className="flex flex-col gap-4 mt-8">
                {/* Organization Switcher for Mobile */}
                <div className="px-3 pb-4 border-b">
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    {tOrg('organization')}
                  </div>
                  <OrganizationSwitcher />
                </div>

                {/* Navigation Links */}
                {filteredNavigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        pathname === item.href
                          ? 'bg-secondary text-foreground'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="text-xl font-bold">RunFlow</div>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden lg:flex lg:gap-x-6">
            {filteredNavigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* Right side items */}
          <div className="flex items-center gap-4">
            {/* Organization Switcher */}
            <div className="hidden md:block">
              <OrganizationSwitcher />
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {pendingInvites.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  {pendingInvites.length}
                </Badge>
              )}
              <span className="sr-only">Notifications</span>
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-avatar.jpg" alt={user?.name || user?.email || ''} />
                    <AvatarFallback>
                      {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                  <UserCircle className="mr-2 h-4 w-4" />
                  {t('profile')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/organizations')}>
                  <Flag className="mr-2 h-4 w-4" />
                  {t('organizations')}
                  {pendingInvites.length > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {pendingInvites.length}
                    </Badge>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  {t('settings')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} variant="destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-gray-900 to-transparent"></div>
    </nav>
    </>
  )
}