import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../database';
import { IUser } from '../interface';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Required field(s): Email, Password.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists.' });
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
  } catch (error) {
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// Login Route (Generates JWT)
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const tokenPayload = { id: user._id, email: user.email };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: 'Login successful!',
      token,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

export default router;
