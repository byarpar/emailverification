'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function VerifyEmailForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [message, setMessage] = useState('Verifying your email...')
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    } else {
      setMessage('Invalid verification link.')
      setIsError(true)
    }
  }, [token])

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`/api/verify-email?token=${token}`)
      const data = await response.json()

      if (response.ok) {
        setMessage('Email verified successfully! You can now log in.')
        setIsError(false)
      } else {
        setMessage(data.message || 'Email verification failed.')
        setIsError(true)
      }
    } catch {
      setMessage('An error occurred. Please try again.')
      setIsError(true)
    }
  }

  return (
    <div className="space-y-4">
      <p className={`text-xl ${isError ? 'text-red-500' : 'text-green-500'}`}>{message}</p>
      {isError && (
        <p className="mt-4">
          If you&apos;re having trouble, please try registering again or contact support.
        </p>
      )}
    </div>
  )
}

