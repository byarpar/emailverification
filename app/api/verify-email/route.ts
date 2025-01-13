import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token')

    if (!token) {
      console.log('Verification attempt with no token')
      return NextResponse.json({ message: 'Verification token is required' }, { status: 400 })
    }

    console.log(`Attempting to verify token: ${token}`)

    await dbConnect()

    const user = await User.findOne({ 
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    })

    if (!user) {
      console.log(`No valid user found with token: ${token}`)
      return NextResponse.json({ message: 'Invalid or expired verification token' }, { status: 400 })
    }

    console.log(`User found: ${user.email}`)

    user.isVerified = true
    user.verificationToken = undefined
    user.verificationTokenExpires = undefined
    await user.save()

    console.log(`User ${user.email} verified successfully`)

    return NextResponse.json({ message: 'Email verified successfully' }, { status: 200 })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

