import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import router from './register';
import { User } from '../../database';

const app = express();
app.use(express.json());
app.use('/auth', router);

vi.mock('../../database', () => {
  const UserMock = vi.fn(function (this: any, userData) {
    Object.assign(this, userData);
    this._id = 'ABC123';
    this.save = vi.fn().mockResolvedValue(true);
  });
  return { User: UserMock };
});

const MockedUser = User as unknown as {
  new (userData: any): any;
  findOne: ReturnType<typeof vi.fn>;
};

MockedUser.findOne = vi.fn();

describe('POST /auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    { description: 'MISSING PASSWORD', payload: { email: 'test@email.com' } },
    { description: 'MISSING EMAIL', payload: { password: 'password' } },
    { description: 'MISSING BOTH', payload: {} },
  ])('RegisterUser_BadRequest_EmailPasswordRequired ($description)', async ({ payload }) => {
    const response = await request(app).post('/auth/register').send(payload);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Required field(s): Email, Password.',
    });
  });

  it('RegisterUser_BadRequest_UserAlreadyExists', async () => {
    MockedUser.findOne.mockResolvedValueOnce({ email: 'test@email.com' });

    const response = await request(app).post('/auth/register').send({
      email: 'test@email.com',
      password: 'password',
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'User already exists.',
    });
    expect(MockedUser.findOne).toHaveBeenCalledWith({ email: 'test@email.com' });
  });

  it('RegisterUser_Ok_UserRegistered', async () => {
    MockedUser.findOne.mockResolvedValueOnce(null);

    const response = await request(app).post('/auth/register').send({
      email: 'test@email.com',
      password: 'password',
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: 'User registered successfully!',
      userId: 'ABC123',
    });
  });
});
