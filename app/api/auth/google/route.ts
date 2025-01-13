import { NextRequest, NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { sign } from 'jsonwebtoken'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()
    if (!payload || !payload.email) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 400 })
    }

    await dbConnect()

    let user = await User.findOne({ email: payload.email })

    if (!user) {
      user = new User({
        email: payload.email,
        googleId: payload.sub,
        isVerified: true,
        profileImageUrl: payload.picture,
        name: payload.name,
        provider: 'google',
        googleInfo: {
          givenName: payload.given_name,
          familyName: payload.family_name,
          locale: payload.locale,
        },
      })
      await user.save()
    } else if (!user.googleId) {
      user.googleId = payload.sub
      user.profileImageUrl = payload.picture
      user.name = payload.name
      user.provider = 'google'
      user.googleInfo = {
        givenName: payload.given_name,
        familyName: payload.family_name,
        locale: payload.locale,
      }
      await user.save()
    }

    const jwtToken = sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '7d' })

    const response = NextResponse.json({ 
      message: 'Google authentication successful',
      user: {
        email: user.email,
        name: user.name,
        profileImageUrl: user.profileImageUrl,
      }
    }, { status: 200 })
    response.cookies.set('token', jwtToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Google authentication error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

