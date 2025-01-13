import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    await dbConnect()

    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString()
    const resetCodeExpires = new Date(Date.now() + 60 * 1000) // 60 seconds from now

    user.resetCode = resetCode
    user.resetCodeExpires = resetCodeExpires
    await user.save()

    await sendVerificationEmail(email, resetCode, 'reset-password')

    const response = NextResponse.json({ message: 'Reset code sent' }, { status: 200 })
    response.cookies.set('pendingResetEmail', email, { 
      maxAge: 10 * 60 * 1000, // 10 minutes
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Send reset code error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

