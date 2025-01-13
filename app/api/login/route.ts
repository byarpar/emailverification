import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { sign } from 'jsonwebtoken'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    await dbConnect()

    const user = await User.findOne({ email })

    if (!user || !(await bcrypt.compare(password, user.password)) || !user.isVerified) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 })
    }

    const token = sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '7d' })

    const response = NextResponse.json({ 
      message: 'Login successful',
      user: {
        email: user.email,
        name: user.name,
        profileImageUrl: user.profileImageUrl,
      }
    }, { status: 200 })
    
    response.cookies.set('token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

