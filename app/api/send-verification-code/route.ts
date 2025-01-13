import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email, purpose } = await req.json()

    if (purpose !== 'registration' && purpose !== 'reset-password') {
      return NextResponse.json({ message: 'Invalid purpose' }, { status: 400 })
    }

    await dbConnect()

    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    user.verificationCode = verificationCode
    user.verificationCodeExpires = verificationCodeExpires
    await user.save()

    await sendVerificationEmail(email, verificationCode, purpose)

    const response = NextResponse.json({ message: 'Verification code sent' }, { status: 200 })
    response.cookies.set('pendingEmail', email, { 
      maxAge: 10 * 60 * 1000, 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })

    return response
  } catch (error) {
    console.error('Send verification code error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

