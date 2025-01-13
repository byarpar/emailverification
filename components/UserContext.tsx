'use client'

import React, { createContext, useState, useContext, useEffect } from 'react'

interface UserProfile {
  name: string;
  email: string;
  profileImageUrl: string | null;
}

interface UserContextType {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/user-profile', {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          // Ensure the profileImageUrl is a valid URL
          const profileImageUrl = data.profileImageUrl && isValidUrl(data.profileImageUrl) 
            ? data.profileImageUrl 
            : null
          setUser({
            ...data,
            profileImageUrl
          })
        } else {
          console.error('Failed to fetch user profile:', response.status)
          setUser(null)
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  // Helper function to validate URLs
  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch {
      return false
    }
  }

  return (
    <UserContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

