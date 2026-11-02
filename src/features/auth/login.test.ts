import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import router from './login'; // Adjust path to your login file
import { User } from '../../database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use('/auth', router);

vi.mock('../../database', () => ({
  User: {
    findOne: vi.fn(),
  },
}));

vi.mock('bcrypt', () => ({
  default: {
    compare: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('mock-jwt-token'),
  },
}));

const MockedUser = User as unknown as {
  findOne: ReturnType<typeof vi.fn>;
};

const MockedBcrypt = bcrypt as unknown as {
  compare: ReturnType<typeof vi.fn>;
};

const MockedJwt = jwt as unknown as {
  sign: ReturnType<typeof vi.fn>;
};

describe('POST /auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    { description: 'MISSING PASSWORD', payload: { email: 'test@email.com' } },
    { description: 'MISSING EMAIL', payload: { password: 'password123' } },
    { description: 'MISSING BOTH', payload: {} },
  ])('LoginUser_BadRequest_EmailPasswordRequired ($description)', async ({ payload }) => {
    const response = await request(app).post('/auth/login').send(payload);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Required field(s): Email, Password.',
    });
  });

  it('LoginUser_Unauthorized_UserNotFound', async () => {
    MockedUser.findOne.mockResolvedValueOnce(null);

    const response = await request(app).post('/auth/login').send({
      email: 'notfound@email.com',
      password: 'password123',
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: 'Invalid email or password.',
    });
    expect(MockedUser.findOne).toHaveBeenCalledWith({ email: 'notfound@email.com' });
  });

  it('LoginUser_Unauthorized_InvalidPassword', async () => {
    MockedUser.findOne.mockResolvedValueOnce({
      _id: 'ABC123',
      email: 'test@email.com',
      passwordHash: 'hashed_password_string',
    });
    MockedBcrypt.compare.mockResolvedValueOnce(false);

    const response = await request(app).post('/auth/login').send({
      email: 'test@email.com',
      password: 'wrongpassword',
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: 'Invalid email or password.',
    });
    expect(MockedBcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashed_password_string');
  });

  it('LoginUser_Ok_SuccessfulLogin', async () => {
    MockedUser.findOne.mockResolvedValueOnce({
      _id: 'ABC123',
      email: 'test@email.com',
      passwordHash: 'hashed_password_string',
    });
    MockedBcrypt.compare.mockResolvedValueOnce(true);

    const response = await request(app).post('/auth/login').send({
      email: 'test@email.com',
      password: 'correctpassword',
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Logged in successfully!',
      token: 'mock-jwt-token',
      userId: 'ABC123',
    });
    expect(MockedJwt.sign).toHaveBeenCalledWith({ userId: 'ABC123', email: 'test@email.com' }, expect.any(String), { expiresIn: '1h' });
  });

  it('LoginUser_InternalServerError_OnException', async () => {
    MockedUser.findOne.mockRejectedValueOnce(new Error('Database error'));

    const response = await request(app).post('/auth/login').send({
      email: 'test@email.com',
      password: 'password123',
    });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: 'Something went wrong.',
    });
  });
});
