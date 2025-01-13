import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value

    if (!token) {
      console.log('No token found in cookies')
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    let decoded;
    try {
      decoded = verify(token, process.env.JWT_SECRET!) as { userId: string }
    } catch (error) {
      console.error('Token verification failed:', error)
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }

    await dbConnect()

    const user = await User.findById(decoded.userId)

    if (!user) {
      console.log('User not found for id:', decoded.userId)
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      email: user.email,
      name: user.name,
      profileImageUrl: user.profileImageUrl,
    }, { status: 200 })

  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

