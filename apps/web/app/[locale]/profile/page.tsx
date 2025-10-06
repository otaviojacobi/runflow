import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ResendConfirmationButton } from '@/components/auth/ResendConfirmationButton'
import { LogoutButton } from '@/components/auth/LogoutButton'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const isEmailConfirmed = user.email_confirmed_at !== null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
              <p className="text-gray-600">Welcome, {user.email}!</p>
            </div>
            <LogoutButton />
          </div>

          {/* Email Verification Status */}
          <div className="border-t pt-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Email Verification</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Email Status</p>
                {isEmailConfirmed ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      ✓ Verified
                    </span>
                    <span className="text-xs text-gray-500">
                      Confirmed on {new Date(user.email_confirmed_at!).toLocaleDateString()}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      ⚠ Not Verified
                    </span>
                    <p className="text-sm text-gray-600">
                      Please check your email for a verification link.
                    </p>
                    <ResendConfirmationButton email={user.email!} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
