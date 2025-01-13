import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { sign } from 'jsonwebtoken'

export async function POST(req: NextRequest) {
  try {
    const { accessToken } = await req.json()
    const response = await fetch(`https://graph.facebook.com/me?fields=id,email,name,picture.type(large),first_name,last_name,locale&access_token=${accessToken}`)
    const data = await response.json()

    if (!data.id || !data.email) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 400 })
    }

    await dbConnect()

    let user = await User.findOne({ email: data.email })

    if (!user) {
      user = new User({
        email: data.email,
        facebookId: data.id,
        isVerified: true,
        profileImageUrl: data.picture.data.url,
        name: data.name,
        provider: 'facebook',
        facebookInfo: {
          firstName: data.first_name,
          lastName: data.last_name,
          locale: data.locale,
        },
      })
      await user.save()
    } else if (!user.facebookId) {
      user.facebookId = data.id
      user.profileImageUrl = data.picture.data.url
      user.name = data.name
      user.provider = 'facebook'
      user.facebookInfo = {
        firstName: data.first_name,
        lastName: data.last_name,
        locale: data.locale,
      }
      await user.save()
    }

    const jwtToken = sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '7d' })

    const responseObj = NextResponse.json({ 
      message: 'Facebook authentication successful',
      user: {
        email: user.email,
        name: user.name,
        profileImageUrl: user.profileImageUrl,
      }
    }, { status: 200 })
    responseObj.cookies.set('token', jwtToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    return responseObj
  } catch (error) {
    console.error('Facebook authentication error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

