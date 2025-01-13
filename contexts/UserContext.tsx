'use client'

import React, { createContext, useState, useContext, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'

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
        const token = localStorage.getItem('token')
        
        if (!token) {
          setUser(null)
          setIsLoading(false)
          return
        }

        // Decode the JWT token
        const decodedToken = jwtDecode(token) as { 
          userId: string, 
          email: string, 
          name: string, 
          profileImageUrl: string,
          exp?: number 
        }

        // Check if the token is expired
        if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
          localStorage.removeItem('token')
          setUser(null)
          setIsLoading(false)
          return
        }

        // Set the user data from the decoded token
        setUser({
          email: decodedToken.email,
          name: decodedToken.name,
          profileImageUrl: decodedToken.profileImageUrl && isValidUrl(decodedToken.profileImageUrl) 
            ? decodedToken.profileImageUrl 
            : null
        })
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
    } catch (_) {
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

