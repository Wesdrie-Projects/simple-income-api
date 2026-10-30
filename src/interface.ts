export interface IUser extends Document {
  email: string;
  firstName: string | null;
  lastName: string | null;
  passwordHash: string;
  isVerified: boolean;
}
