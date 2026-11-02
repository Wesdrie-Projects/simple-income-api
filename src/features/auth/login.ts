import { Router, Request, Response } from 'express';
import { User } from '../../database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export const loginHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Required field(s): Email, Password.' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, existingUser.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const payload = {
      userId: existingUser._id,
      email: existingUser.email,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Logged in successfully!',
      token,
      userId: existingUser._id,
    });
  } catch (error: unknown) {
    res.status(500).json({ error: 'Something went wrong.' });
  }
};

const router = Router();
router.post('/login', loginHandler);

export default router;
