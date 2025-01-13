import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import Link from 'next/link'

export default function Home() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')
  let isLoggedIn = false
  let userId = null

  if (token) {
    try {
      const decoded = verify(token.value, process.env.JWT_SECRET!)
      isLoggedIn = true
      userId = (decoded as { userId: string }).userId
    } catch (error) {
      console.error('Invalid token:', error)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to MyApp</h1>
      {isLoggedIn ? (
        <p className="text-xl">You are logged in! User ID: {userId}</p>
      ) : (
        <p className="text-xl">Please log in or register to get started.</p>
      )}
      <div className="mt-8 space-x-4">
        {!isLoggedIn && (
          <>
            <Link href="/login" className="text-blue-600 hover:underline">Login</Link>
            <Link href="/register" className="text-blue-600 hover:underline">Register</Link>
          </>
        )}
        {isLoggedIn && (
          <Link href="/api/logout" className="text-blue-600 hover:underline">Logout</Link>
        )}
      </div>
    </div>
  )
}

