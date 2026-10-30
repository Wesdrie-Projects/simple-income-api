import 'dotenv/config';
import express, { Request, Response } from 'express';
import { authMiddleware, AuthRequest } from './middleware';
import { connectDatabaseAsync } from './database';
import authRoutes from './features/auth';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

app.use('/auth', authRoutes);

app.get('/protected', authMiddleware, (req: AuthRequest, res: Response) => {
  res.json({
    message: 'Access granted to protected database data!',
    user: req.user,
  });
});

const startServerAsync = async (): Promise<void> => {
  await connectDatabaseAsync();

  app.listen(PORT, (): void => {
    const ENVIRONMENT = process.env.ENV ? process.env.ENV : 'development';
    switch (ENVIRONMENT) {
      case 'production':
        console.log('[SERVER][PROD] Server Running');
        break;
      default:
        console.log(`[SERVER][DEV] http://localhost:${PORT}`);
    }
  });
};

startServerAsync();
