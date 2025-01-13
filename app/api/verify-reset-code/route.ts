import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()
    const email = req.cookies.get('pendingEmail')?.value

    if (!email) {
      return NextResponse.json({ message: 'No pending password reset found' }, { status: 400 })
    }

    await dbConnect()

    const user = await User.findOne({
      email,
      verificationCode: code,
      verificationCodeExpires: { $gt: Date.now() },
    })

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired verification code' }, { status: 400 })
    }

    const response = NextResponse.json({ message: 'Verification code valid' }, { status: 200 })
    response.cookies.set('resetVerified', 'true', { 
      maxAge: 10 * 60 * 1000, // 10 minutes
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })

    return response
  } catch (error) {
    console.error('Verify reset code error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

