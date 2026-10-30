import mongoose from 'mongoose';
import { UserSchema } from './schema';
import { IUser } from '../interface';

const MONGO_URI = process.env.MONGO_URI || 'fallback_uri';

export const User = mongoose.model<IUser>('User', UserSchema);

export const connectDatabaseAsync = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[DATABASE][MONGO] Successfully connected to DB');
  } catch (error: unknown) {
    const errorMessage: string = error instanceof Error ? error.message : String(error);
    console.error(`[DATABASE][MONGO] Error Connecting to DB: ${errorMessage}`, error);
    process.exit(1);
  }
};
