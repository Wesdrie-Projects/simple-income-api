export interface IUser extends Document {
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  isVerified: boolean;
}
