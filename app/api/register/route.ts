import { NextRequest, NextResponse } from 'next/server'
import { sendVerificationEmail } from '@/lib/email'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json()

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    const userData = {
      email,
      password: hashedPassword,
      name,
      verificationCode,
      verificationCodeExpires: Date.now() + 10 * 60 * 1000, // 10 minutes
    }

    await sendVerificationEmail(email, verificationCode, 'registration')

    const response = NextResponse.json({ message: 'Verification code sent. Please check your email.' }, { status: 200 })
    response.cookies.set('pendingUserData', JSON.stringify(userData), { 
      maxAge: 10 * 60 * 1000, // 10 minutes
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

