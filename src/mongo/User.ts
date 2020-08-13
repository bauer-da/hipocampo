import bcrypt from 'bcrypt'
import { Document, Schema, model } from 'mongoose'

export interface User {
  username: string
  password: string
  email: string
  roles: string[]
  lastLogin?: Date
  createdAt: Date
  preferences?: UserPreferences
}

export interface UserPreferences {
  zoneInfo: string
}

export interface UserDocument extends User, Document {
  hashifyAndSave(): Promise<void>
  comparePassword(candidate: string): Promise<boolean>
}

export interface UserPreferencesDocument extends UserPreferences, Document {}

const UserPreferencesSchema = new Schema<UserPreferencesDocument>({
  zoneInfo: {
    type: String,
    default: 'UTC',
  },
})

const UserSchema = new Schema<UserDocument>(
  {
    username: {
      type: String,
      unique: true,
      required: [true, 'Username is required'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    email: {
      type: String,
      unique: true,
      required: [true, 'E-mail is required'],
    },
    roles: {
      type: [{ type: String }],
      default: ['REGULAR'],
    },
    lastLogin: {
      type: Schema.Types.Date,
    },
    preferences: UserPreferencesSchema,
    createdAt: { type: Schema.Types.Date },
    updatedAt: { type: Schema.Types.Date },
  },
  { timestamps: { createdAt: true } }
)

UserSchema.methods.hashifyAndSave = function () {
  return new Promise((res, rej) => {
    bcrypt.hash(this.password, 12, (err, hash) => {
      if (err) {
        console.error(err) // eslint-disable-line no-console
        rej(err)
        return
      }

      this.password = hash
      this.save().then(() => res())
    })
  })
}

UserSchema.methods.comparePassword = function (candidate) {
  return new Promise((res, rej) => {
    bcrypt.compare(candidate, this.password, (err, isMatch) => {
      if (err) {
        console.error(err) // eslint-disable-line no-console
        return rej(err)
      }

      res(isMatch)
    })
  })
}

export default model<UserDocument>('User', UserSchema)
