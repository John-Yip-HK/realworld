import type { Request, Response } from 'express';
import { Mock } from 'vitest';

import { createUser, getUserByEmail, getUserByUsername } from '../../dao/usersDao';
import { comparePassword, hashPassword } from '../../utils/passwordUtils';
import { signJwt } from '../../utils/jwtUtils';
import { handleUserResponse } from '../../utils/handleUserResponseUtils';
import { registerUserController, logInUserController } from '../../controllers/usersController';
import prisma from '../../prisma/__mocks__/client';
import { password } from '../../__mocks__/bun';
import * as jwt from '../../__mocks__/jsonwebtoken'; 

import statusCodes from '../../constants/status-codes';
import { DEFAULT_IMAGE_URL } from '../../constants/users';

import type { UserResponse, UserCredentials } from '../../routes/User';

const { 
  BAD_REQUEST, 
  UNPROCESSABLE_ENTITY, 
  INTERNAL_SERVER_ERROR, 
  CREATED, 
  FORBIDDEN 
} = statusCodes;

vi.mock('../../utils/handleUserResponseUtils');

describe('registerUserController', () => {
  let req: Request<void, UserResponse, { user: UserCredentials }>;
  let res: Response<UserResponse>;

  beforeEach(() => {
    req = {
      body: {
        user: {
          email: 'test@example.com',
          username: 'testuser',
          password: 'password',
        },
      },
    } as Request<void, UserResponse, { user: UserCredentials }>;

    res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as Response<UserResponse>;
  });

  test('should return BAD_REQUEST if required fields are missing', async () => {
    req.body.user.email = '';

    await registerUserController(req, res);

    expect(res.status).toHaveBeenCalledWith(BAD_REQUEST.code);
    expect(res.send).toHaveBeenCalledWith({
      errors: {
        email: ["can't be blank"],
      },
    });

    req.body.user.email = 'test@example.com';
    req.body.user.username = '';

    await registerUserController(req, res);

    expect(res.status).toHaveBeenCalledWith(BAD_REQUEST.code);
    expect(res.send).toHaveBeenCalledWith({
      errors: {
        username: ["can't be blank"],
      },
    });

    req.body.user.username = 'testuser';
    req.body.user.password = '';

    await registerUserController(req, res);

    expect(res.status).toHaveBeenCalledWith(BAD_REQUEST.code);
    expect(res.send).toHaveBeenCalledWith({
      errors: {
        password: ["can't be blank"],
      },
    });
  });

  test('should return UNPROCESSABLE_ENTITY if user with same email or username already exists', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({ 
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      hashedPassword: 'hashedPassword',
      bio: null,
      image: '',
      followedUsers: [],
    });

    await registerUserController(req, res);

    expect(res.status).toHaveBeenCalledWith(UNPROCESSABLE_ENTITY.code);
    expect(res.send).toHaveBeenCalledWith({
      errors: {
        email: ['has already been taken'],
      },
    });

    prisma.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ 
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        hashedPassword: 'hashedPassword',
        bio: null,
        image: '',
        followedUsers: [],
      });

    await registerUserController(req, res);

    expect(res.status).toHaveBeenCalledWith(UNPROCESSABLE_ENTITY.code);
    expect(res.send).toHaveBeenCalledWith({
      errors: {
        username: ['has already been taken'],
      },
    });
  });

  test('should create a new user and return CREATED status with user data and auth token', async () => {
    const mockHashedPassword = 'hashedPassword';
    const mockAuthToken = 'authToken';
    const mockCreatedUser = {
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
      hashedPassword: mockHashedPassword,
      bio: null,
      image: '',
      followedUsers: [],
    };
    
    password.hash.mockResolvedValueOnce(mockHashedPassword);
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue(mockCreatedUser);
    jwt.sign.mockImplementationOnce(() => mockAuthToken);

    await registerUserController(req, res);

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: 'test@example.com',
        username: 'testuser',
        hashedPassword: mockHashedPassword,
        image: DEFAULT_IMAGE_URL
      }
    });
    expect(res.status).toHaveBeenCalledWith(CREATED.code);
    expect(jwt.sign.mock.calls[0][0]).toEqual({ email: mockCreatedUser.email });
    expect(handleUserResponse).toHaveBeenCalledWith(mockCreatedUser, mockAuthToken);
  });

  test('should return INTERNAL_SERVER_ERROR if an error occurs during registration', async () => {
    prisma.user.findUnique.mockRejectedValueOnce(new Error('Database error'));

    await registerUserController(req, res);

    expect(res.status).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR.code);
    expect(res.send).toHaveBeenCalledWith({
      error: 'Cannot register user',
      details: new Error('Database error'),
    });
  });
});

describe('logInUserController', () => {
  let req: Request<void, UserResponse, { user: Omit<UserCredentials, 'username'> }>;
  let res: Response<UserResponse>;

  beforeEach(() => {
    req = {
      body: {
        user: {
          email: 'test@example.com',
          password: 'password',
        },
      },
    } as Request<void, UserResponse, { user: Omit<UserCredentials, 'username'> }>;

    res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as Response<UserResponse>;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should return BAD_REQUEST if required fields are missing', async () => {
    req.body.user.email = '';
    await logInUserController(req, res);
    expect(res.status).toHaveBeenCalledWith(BAD_REQUEST.code);
    expect(res.send).toHaveBeenCalledWith({
      errors: {
        email: ["can't be blank"],
      },
    });

    req.body.user.email = 'test@example.com';
    req.body.user.password = '';
    await logInUserController(req, res);
    expect(res.status).toHaveBeenCalledWith(BAD_REQUEST.code);
    expect(res.send).toHaveBeenCalledWith({
      errors: {
        password: ["can't be blank"],
      },
    });
  });

  test('should return FORBIDDEN if user with the provided email does not exist', async () => {
    (getUserByEmail as Mock).mockResolvedValueOnce(null);

    await logInUserController(req, res);
    expect(res.status).toHaveBeenCalledWith(FORBIDDEN.code);
    expect(res.send).toHaveBeenCalledWith({
      errors: {
        'email or password': ['is invalid'],
      },
    });
  });

  test('should return FORBIDDEN if provided password is incorrect', async () => {
    (getUserByEmail as Mock).mockResolvedValueOnce({
      email: 'test@example.com',
      hashedPassword: 'hashedPassword',
    });
    (comparePassword as Mock).mockResolvedValueOnce(false);

    await logInUserController(req, res);
    expect(res.status).toHaveBeenCalledWith(FORBIDDEN.code);
    expect(res.send).toHaveBeenCalledWith({
      errors: {
        'email or password': ['is invalid'],
      },
    });
  });

  test('should return CREATED status with user data and auth token if login is successful', async () => {
    (getUserByEmail as Mock).mockResolvedValueOnce({
      email: 'test@example.com',
      hashedPassword: 'hashedPassword',
    });
    (comparePassword as Mock).mockResolvedValueOnce(true);
    (signJwt as Mock).mockReturnValueOnce('authToken');
    (handleUserResponse as Mock).mockReturnValueOnce({
      user: {
        email: 'test@example.com',
        username: 'testuser',
      },
      token: 'authToken',
    });

    await logInUserController(req, res);
    expect(res.status).toHaveBeenCalledWith(CREATED.code);
    expect(res.send).toHaveBeenCalledWith({
      user: {
        email: 'test@example.com',
        username: 'testuser',
      },
      token: 'authToken',
    });
  });

  test('should return INTERNAL_SERVER_ERROR if an error occurs during login', async () => {
    (getUserByEmail as Mock).mockRejectedValueOnce(new Error('Database error'));

    await logInUserController(req, res);
    expect(res.status).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR.code);
    expect(res.send).toHaveBeenCalledWith({
      error: 'Cannot login',
      details: new Error('Database error'),
    });
  });
});