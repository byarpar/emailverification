'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"

export default function VerificationForm() {
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60) // 60 seconds for code expiration
  const [cooldown, setCooldown] = useState(0) // Cooldown for resend button
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0))
      setCooldown((prevCooldown) => (prevCooldown > 0 ? prevCooldown - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await response.json()
    
      if (response.ok) {
        setMessage('Verification successful! Redirecting to login page...')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setMessage(data.message || 'Verification failed')
        if (data.message === 'No pending registration found. Please try registering again.') {
          setTimeout(() => {
            router.push('/register')
          }, 2000)
        }
      }
    } catch {
      setMessage('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (cooldown > 0) return
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/resend-code', {
        method: 'POST',
      })
      const data = await response.json()

      if (response.ok) {
        setTimeLeft(60) // Reset to 60 seconds
        setCooldown(60) // Set cooldown to 60 seconds
        setMessage('Verification code resent. Please check your email.')
      } else {
        setMessage(data.message || 'Failed to resend verification code')
      }
    } catch {
      setMessage('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Verify Your Email</CardTitle>
        <CardDescription>Enter the verification code sent to your email</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              placeholder="Enter your 6-digit code"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || timeLeft === 0}
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </Button>
        </form>
        {message && (
          <Alert className="mt-4" variant={message.includes('successful') ? 'default' : 'destructive'}>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-4">
        {timeLeft > 0 ? (
          <p className="text-sm text-center text-gray-500">
            Code expires in: {timeLeft} seconds
          </p>
        ) : (
          <p className="text-sm text-center text-red-500">
            Verification code has expired. Please resend or register again.
          </p>
        )}
        <Button
          onClick={handleResendCode}
          disabled={isLoading || cooldown > 0}
          variant="outline"
          className="w-full"
        >
          Resend Code
        </Button>
      </CardFooter>
    </Card>
  )
}

