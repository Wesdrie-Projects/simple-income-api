import { Router, Request, Response } from 'express';
import { User } from '../../database';

export const registerHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Required field(s): Email, Password.' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'User already exists.' });
      return;
    }

    const newUser = new User({
      email,
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      passwordHash: password,
      isVerified: false,
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully!', userId: newUser._id });
  } catch (error: unknown) {
    res.status(500).json({ error: 'Something went wrong.' });
  }
};

const router = Router();
router.post('/register', registerHandler);

export default router;
