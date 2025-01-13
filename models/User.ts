import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email address'],
    unique: true,
  },
  password: {
    type: String,
  },
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationCode: {
    type: String,
  },
  verificationCodeExpires: {
    type: Date,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  facebookId: {
    type: String,
    unique: true,
    sparse: true,
  },
  profileImageUrl: {
    type: String,
  },
  provider: {
    type: String,
    enum: ['email', 'google', 'facebook'],
    default: 'email',
  },
  googleInfo: {
    type: Object,
  },
  facebookInfo: {
    type: Object,
  },
})

export default mongoose.models.User || mongoose.model('User', UserSchema)

