import { ObjectId } from 'mongoose';

export interface IUser extends Document {
  email: string;
  firstName: string | null;
  lastName: string | null;
  passwordHash: string;
  isVerified: boolean;
}

export interface ITransaction extends Document {
  userId: ObjectId;
  date: Date;
  name: string | null;
  amount: number;
  type: 'INCOME' | 'SPENDETURE';
  source: string;
}
