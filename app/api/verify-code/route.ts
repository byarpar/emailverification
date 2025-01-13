import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()
    const pendingUserDataCookie = req.cookies.get('pendingUserData')

    if (!pendingUserDataCookie) {
      return NextResponse.json({ message: 'No pending registration found. Please try registering again.' }, { status: 400 })
    }

    const pendingUserData = JSON.parse(pendingUserDataCookie.value)

    if (code !== pendingUserData.verificationCode) {
      return NextResponse.json({ message: 'Invalid verification code' }, { status: 400 })
    }

    if (Date.now() > pendingUserData.verificationCodeExpires) {
      return NextResponse.json({ message: 'Verification code has expired. Please register again.' }, { status: 400 })
    }

    await dbConnect()

    const existingUser = await User.findOne({ email: pendingUserData.email })
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 })
    }

    const newUser = new User({
      email: pendingUserData.email,
      password: pendingUserData.password,
      name: pendingUserData.name,
      isVerified: true,
      provider: 'email'
    })

    await newUser.save()

    const response = NextResponse.json({ message: 'User verified and created successfully' }, { status: 200 })
    response.cookies.delete('pendingUserData')

    return response
  } catch (error) {
    console.error('Verify code error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

