import mongoose from 'mongoose';
import { IUser } from '../interface';

export const UserSchema = new mongoose.Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
});
