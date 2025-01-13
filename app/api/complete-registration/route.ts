import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    await dbConnect()

    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    if (!user.isVerified) {
      return NextResponse.json({ message: 'Email not verified' }, { status: 400 })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    user.password = hashedPassword
    await user.save()

    return NextResponse.json({ message: 'Registration completed successfully' }, { status: 200 })
  } catch (error) {
    console.error('Complete registration error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

