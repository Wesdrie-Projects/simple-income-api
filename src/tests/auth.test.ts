import request from 'supertest';
import express from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { describe, beforeAll, beforeEach, afterAll, it, expect } from '@jest/globals';
import authRoutes from '../features/auth';
import { User } from '../database'; // <-- Added User import

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('POST /auth/register', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  }, 60000);

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('RegisterUserSuccessfully', async () => {
    const response = await request(app).post('/auth/register').send({
      email: 'test@example.com',
      password: 'securePassword123',
      firstName: 'John',
      lastName: 'Doe',
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'User registered successfully!');
    expect(response.body).toHaveProperty('userId');

    const savedUser = await User.findOne({ email: 'test@example.com' });
    expect(savedUser).not.toBeNull();
    expect(savedUser?.email).toBe('test@example.com');
  });
});
