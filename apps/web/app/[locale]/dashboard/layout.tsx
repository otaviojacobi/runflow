import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { OrganizationProvider } from '@/contexts/OrganizationContext'

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <OrganizationProvider>
      <div className="min-h-screen relative">
        {/* Animated gradient background similar to login page */}
        <div className="fixed inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-violet-100">
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-100/60 via-transparent to-violet-200/60 animate-pulse" style={{ animationDuration: '8s' }}></div>
          <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-blue-100/30 to-purple-200/50 animate-pulse" style={{ animationDuration: '12s' }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <DashboardNav />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </div>
    </OrganizationProvider>
  )
}