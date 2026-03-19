'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { createClient } from '@/lib/supabase/client'

function VerifyEmailContent() {
  const t = useTranslations('Auth.verifyEmail')
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const redirectTo = searchParams.get('redirect')

  // Build login URL with redirect and email params
  const loginParams = new URLSearchParams()
  if (email) loginParams.set('email', email)
  if (redirectTo) loginParams.set('redirect', redirectTo)
  const loginUrl = loginParams.toString() ? `/login?${loginParams.toString()}` : '/login'
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !otp) return

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup',
      })

      if (verifyError) {
        setError(verifyError.message)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError(t('errorGeneric'))
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) return

    setResending(true)
    setResendMessage('')
    setError('')

    try {
      const response = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setResendMessage(t('resendSuccess'))
      } else {
        setError(data.error || t('resendError'))
      }
    } catch (err) {
      setError(t('errorGeneric'))
    } finally {
      setResending(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('successTitle')}</h1>
          <p className="text-gray-600 mb-6">
            {t('successMessage')}
          </p>
          <Link
            href={loginUrl}
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('goToSignIn')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              RunFlow
            </span>
          </Link>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-gray-900 to-transparent"></div>
      </header>

      <div className="flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('title')}</h1>
            <p className="text-gray-600">
              {t('subtitle')}{' '}
              <span className="font-medium text-gray-900">{email}</span>
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              {t('instructions')}
            </p>
          </div>

          <form onSubmit={handleVerifyOTP} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {resendMessage && (
              <div className="rounded-md bg-green-50 p-4">
                <p className="text-sm text-green-800">{resendMessage}</p>
              </div>
            )}

            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                {t('verificationCodeLabel')}
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder={t('verificationCodePlaceholder')}
                maxLength={6}
                className="block w-full px-4 py-3 text-center text-base tracking-widest border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? t('verifyingButton') : t('verifyButton')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">{t('didntReceive')}</p>
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-sm font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
            >
              {resending ? t('sendingButton') : t('resendButton')}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t text-center text-sm">
            <span className="text-gray-600">{t('alreadyVerified')} </span>
            <Link href={loginUrl} className="font-medium text-blue-600 hover:text-blue-500">
              {t('signInLink')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  const t = useTranslations('Auth.verifyEmail')

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-600">{t('loading')}</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
