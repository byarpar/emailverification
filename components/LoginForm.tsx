'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { SocialLoginButtons } from './SocialLoginButtons'
import { useUser } from '@/contexts/UserContext'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleInitParams) => void;
          prompt: () => void;
          renderButton: (element: HTMLElement, options: GoogleRenderButtonParams) => void;
        };
      };
    };
    FB?: {
      init: (config: FacebookInitParams) => void;
      login: (callback: (response: FacebookLoginResponse) => void, config: FacebookLoginParams) => void;
    };
  }
}

interface GoogleInitParams {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
}

interface GoogleRenderButtonParams {
  type: string;
  theme: string;
  size: string;
  text: string;
  shape: string;
  logo_alignment: string;
  width: number;
}

interface GoogleCredentialResponse {
  credential: string;
}

interface FacebookInitParams {
  appId: string | undefined;
  cookie: boolean;
  xfbml: boolean;
  version: string;
}

interface FacebookLoginResponse {
  authResponse: {
    accessToken: string;
    expiresIn: number;
    signedRequest: string;
    userID: string;
  } | null;
  status: 'connected' | 'not_authorized' | 'unknown';
}

interface FacebookLoginParams {
  scope: string;
}

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isFacebookReady, setIsFacebookReady] = useState(false)
  const router = useRouter()
  const { setUser } = useUser()

  const handleGoogleResponse = useCallback(async (response: GoogleCredentialResponse) => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential }),
      })
      const data = await res.json()
      if (res.ok) {
        setUser(data.user)
        router.push('/')
      } else {
        setMessage(data.message || 'Google login failed')
      }
    } catch (error) {
      console.error('Google login error:', error);
      setMessage('An error occurred during Google login. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [setUser, router, setMessage, setIsLoading]);

  useEffect(() => {
    const checkFacebookSDK = setInterval(() => {
      if (window.FB) {
        setIsFacebookReady(true)
        clearInterval(checkFacebookSDK)
      }
    }, 100)

    if (typeof window !== 'undefined' && window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: handleGoogleResponse,
      });
    }

    return () => clearInterval(checkFacebookSDK)
  }, [handleGoogleResponse])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      
      if (response.ok) {
        setUser(data.user)
        router.push('/')
      } else {
        setMessage(data.message || 'Login failed')
      }
    } catch {
      setMessage('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    } else {
      setMessage('Google Sign-In is not available. Please try again later.');
    }
  }

  const handleFacebookLogin = () => {
    if (isFacebookReady && window.FB) {
      window.FB.login((response) => {
        if (response.authResponse) {
          handleFacebookResponse(response.authResponse.accessToken);
        } else {
          setMessage('Facebook login was cancelled');
        }
      }, {scope: 'email'});
    } else {
      setMessage('Facebook login is not available. Please try again later.');
    }
  }

  const handleFacebookResponse = async (accessToken: string) => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/auth/facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user)
        router.push('/');
      } else {
        setMessage(data.message || 'Facebook login failed');
      }
    } catch (error) {
      console.error('Facebook login error:', error);
      setMessage('An error occurred during Facebook login. Please try again.');
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-center">Login to Your Account</CardTitle>
          <CardDescription className="text-sm sm:text-base text-center">Enter your email and password to login</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm sm:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 pr-10 text-sm sm:text-base"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 px-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
            {message && (
              <Alert variant="destructive">
                <AlertTitle className="text-sm sm:text-base">Error</AlertTitle>
                <AlertDescription className="text-sm sm:text-base">{message}</AlertDescription>
              </Alert>
            )}
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-sm sm:text-base py-2 sm:py-3" 
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <div className="mt-6 sm:mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>
            <div className="mt-6">
              <SocialLoginButtons onGoogleLogin={handleGoogleLogin} onFacebookLogin={handleFacebookLogin} />
            </div>
          </div>
          <div className="mt-6 text-sm sm:text-base text-center">
            <Link href="/forgot-password" className="text-primary hover:underline">
              Forgot Password?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

