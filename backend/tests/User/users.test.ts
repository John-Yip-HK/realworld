import type { Request, Response } from 'express';
import { Mock } from 'vitest';

import { createUser, getUserByEmail, getUserByUsername } from '../../dao/usersDao';
import { comparePassword, hashPassword } from '../../utils/passwordUtils';
import { signJwt } from '../../utils/jwtUtils';
import { handleUserResponse } from '../../utils/handleUserResponseUtils';
import { registerUserController, logInUserController } from '../../controllers/usersController';
import { UserResponse, UserCredentials } from '../../routes/User';

import statusCodes from '../../constants/status-codes';

vi.mock('../../utils/passwordUtils');
vi.mock('../../utils/jwtUtils');
vi.mock('../../utils/handleUserResponseUtils');
vi.mock('../../dao/usersDao');

const { BAD_REQUEST, UNPROCESSABLE_ENTITY, INTERNAL_SERVER_ERROR, CREATED, FORBIDDEN } = statusCodes;

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

  afterEach(() => {
    vi.clearAllMocks();
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
    (getUserByEmail as Mock).mockResolvedValueOnce({ email: 'test@example.com' });
    await registerUserController(req, res);
    expect(res.status).toHaveBeenCalledWith(UNPROCESSABLE_ENTITY.code);
    expect(res.send).toHaveBeenCalledWith({
      errors: {
        email: ['has already been taken'],
      },
    });

    (getUserByEmail as Mock).mockResolvedValueOnce(null);
    (getUserByUsername as Mock).mockResolvedValueOnce({ username: 'testuser' });
    await registerUserController(req, res);
    expect(res.status).toHaveBeenCalledWith(UNPROCESSABLE_ENTITY.code);
    expect(res.send).toHaveBeenCalledWith({
      errors: {
        username: ['has already been taken'],
      },
    });
  });

  test('should create a new user and return CREATED status with user data and auth token', async () => {
    (getUserByEmail as Mock).mockResolvedValueOnce(null);
    (getUserByUsername as Mock).mockResolvedValueOnce(null);
    (hashPassword as Mock).mockResolvedValueOnce('hashedPassword');
    (createUser as Mock).mockResolvedValueOnce({
      email: 'test@example.com',
      username: 'testuser',
    });
    (signJwt as Mock).mockReturnValueOnce('authToken');
    (handleUserResponse as Mock).mockReturnValueOnce({
      user: {
        email: 'test@example.com',
        username: 'testuser',
      },
      token: 'authToken',
    });

    await registerUserController(req, res);
    expect(res.status).toHaveBeenCalledWith(CREATED.code);
    expect(res.send).toHaveBeenCalledWith({
      user: {
        email: 'test@example.com',
        username: 'testuser',
      },
      token: 'authToken',
    });
  });

  test('should return INTERNAL_SERVER_ERROR if an error occurs during registration', async () => {
    (getUserByEmail as Mock).mockRejectedValueOnce(new Error('Database error'));

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