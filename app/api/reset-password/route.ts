import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(req: NextRequest) {
  try {
    const { newPassword } = await req.json()
    const email = req.cookies.get('pendingEmail')?.value
    const resetVerified = req.cookies.get('resetVerified')?.value

    if (!email || !resetVerified) {
      return NextResponse.json({ message: 'Invalid password reset attempt' }, { status: 400 })
    }

    await dbConnect()

    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    user.password = hashedPassword
    user.verificationCode = undefined
    user.verificationCodeExpires = undefined
    await user.save()

    const response = NextResponse.json({ message: 'Password reset successfully' }, { status: 200 })
    response.cookies.delete('pendingEmail')
    response.cookies.delete('resetVerified')

    return response
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

