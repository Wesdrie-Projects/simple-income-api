import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcrypt';
import { UserSchema } from './schema';
import { IUser } from '../interface';

const MONGO_URI = process.env.MONGO_URI || 'fallback_uri';

UserSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  } catch (error: any) {
    throw error;
  }
});

export const User = mongoose.model<IUser>('User', UserSchema);

export const connectDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[DATABASE][MONGO] Successfully connected to DB');
  } catch (error) {
    console.error('[DATABASE][MONGO] Error Connecting to DB', error);
    process.exit(1);
  }
};
