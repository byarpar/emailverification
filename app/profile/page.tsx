'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AccountProfileImage } from "@/components/AccountProfileImage"

interface UserProfile {
  email: string;
  name: string;
  profileImageUrl: string | null;
  provider: 'email' | 'google' | 'facebook';
  googleInfo?: {
    givenName: string;
    familyName: string;
    locale: string;
  };
  facebookInfo?: {
    firstName: string;
    lastName: string;
    locale: string;
  };
}

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/user-profile')
        if (response.ok) {
          const data = await response.json()
          setUserProfile(data)
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
        router.push('/login')
      }
    }

    fetchUserProfile()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  if (!userProfile) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">User Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <AccountProfileImage
            src={userProfile.profileImageUrl}
            alt={userProfile.name || 'User'}
            size={128}
          />
          <p className="text-lg font-semibold">{userProfile.name}</p>
          <p className="text-md">{userProfile.email}</p>
          <p className="text-sm text-gray-500">Signed in with: {userProfile.provider}</p>
          
          {userProfile.provider === 'google' && userProfile.googleInfo && (
            <div className="text-sm">
              <p>Given Name: {userProfile.googleInfo.givenName}</p>
              <p>Family Name: {userProfile.googleInfo.familyName}</p>
              <p>Locale: {userProfile.googleInfo.locale}</p>
            </div>
          )}

          {userProfile.provider === 'facebook' && userProfile.facebookInfo && (
            <div className="text-sm">
              <p>First Name: {userProfile.facebookInfo.firstName}</p>
              <p>Last Name: {userProfile.facebookInfo.lastName}</p>
              <p>Locale: {userProfile.facebookInfo.locale}</p>
            </div>
          )}

          <Button onClick={handleLogout} variant="outline">Logout</Button>
        </CardContent>
      </Card>
    </div>
  )
}

