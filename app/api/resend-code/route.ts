import { NextRequest, NextResponse } from 'next/server'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const pendingUserDataCookie = req.cookies.get('pendingUserData')

    if (!pendingUserDataCookie) {
      return NextResponse.json({ message: 'No pending registration found' }, { status: 400 })
    }

    const pendingUserData = JSON.parse(pendingUserDataCookie.value)

    const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const newExpirationTime = Date.now() + 10 * 60 * 1000 // 10 minutes from now

    const updatedUserData = {
      ...pendingUserData,
      verificationCode: newVerificationCode,
      verificationCodeExpires: newExpirationTime,
    }

    await sendVerificationEmail(pendingUserData.email, newVerificationCode, 'registration')

    const response = NextResponse.json({ message: 'Verification code resent' }, { status: 200 })
    response.cookies.set('pendingUserData', JSON.stringify(updatedUserData), { 
      maxAge: 10 * 60 * 1000, // 10 minutes
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Resend code error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

