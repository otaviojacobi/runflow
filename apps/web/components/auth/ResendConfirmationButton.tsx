'use client'

import { useState } from 'react'

interface ResendConfirmationButtonProps {
  email: string
}

export function ResendConfirmationButton({ email }: ResendConfirmationButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleResend = async () => {
    setIsLoading(true)
    setMessage(null)

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
        setMessage({
          type: 'success',
          text: 'Confirmation email sent! Please check your inbox.',
        })
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to send confirmation email. Please try again.',
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleResend}
        disabled={isLoading}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Sending...' : 'Resend Confirmation Email'}
      </button>
      {message && (
        <p
          className={`text-sm ${
            message.type === 'success' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  )
}
