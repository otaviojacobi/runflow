'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Check for stored redirect from OAuth flow
    const storedRedirect = localStorage.getItem('auth_redirect')

    if (storedRedirect) {
      localStorage.removeItem('auth_redirect')
      router.push(storedRedirect)
    } else {
      router.push('/dashboard')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-blue-50 to-violet-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecionando...</p>
      </div>
    </div>
  )
}
