import type { Request, Response } from 'express';
import type { Mock } from 'vitest';

import { getCurrentUserController, updateCurrentUserController } from '../../controllers/userController';

import { 
  getUserByUsername, 
  getUserByEmail, 
  updateUserByEmail, 
} from '../../dao/usersDao';

import statusCodes from '../../constants/status-codes';

import type { UserReqBody, UserResponse } from '../../routes/User';

const { BAD_REQUEST, UNPROCESSABLE_ENTITY, INTERNAL_SERVER_ERROR } = statusCodes;

vi.mock('../../utils/jwtUtils');
vi.mock('../../utils/passwordUtils');
vi.mock('../../dao/usersDao');

describe('getCurrentUserController', () => {
  test('should return current user with filtered fields if user has followed users', () => {
    const req = {
      user: {
        followedUsers: ['user1', 'user2'],
        name: 'John Doe',
        email: 'john@example.com',
      },
    } as unknown as Request<void, UserResponse, void>;

    const res = {
      send: vi.fn(),
    } as unknown as Response<UserResponse>;

    getCurrentUserController(req, res);

    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      user: {
        name: 'John Doe',
        email: 'john@example.com',
      },
    });
  });

  test('should return current user without filtering if user has no followed users', () => {
    const req = {
      user: {
        name: 'John Doe',
        email: 'john@example.com',
      },
    } as unknown as Request<void, UserResponse, void>;
    const res = {
      send: vi.fn(),
    } as unknown as Response<UserResponse>;

    getCurrentUserController(req, res);

    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      user: {
        name: 'John Doe',
        email: 'john@example.com',
      },
    });
  });
});

describe('updateCurrentUserController', () => {
  let req: Request<void, UserResponse, UserReqBody>;
  let res: Response<UserResponse>;

  beforeEach(() => {
    req = {
      body: {
        user: {
          username: 'test',
          email: 'test@test.com',
          password: 'password',
        },
      },
      user: {
        email: 'test@test.com',
        token: 'token',
      },
    } as unknown as Request<void, UserResponse, UserReqBody>;

    res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as Response<UserResponse>;
  });

  it('should return BAD_REQUEST if newUserDetails or newUserDetails.user is not provided', async () => {
    req.body = {} as UserReqBody;
    await updateCurrentUserController(req, res);
    expect(res.status).toHaveBeenCalledWith(BAD_REQUEST.code);
    expect(res.send).toHaveBeenCalledWith({
      errors: {
        newUser: ['no details'],
      },
    });
  });

  it('should return UNPROCESSABLE_ENTITY if username is already taken', async () => {
    (getUserByUsername as Mock).mockResolvedValueOnce({ username: 'test' });
    await updateCurrentUserController(req, res);
    expect(res.status).toHaveBeenCalledWith(UNPROCESSABLE_ENTITY.code);
    expect(res.send).toHaveBeenCalledWith({
      errors: {
        username: ['is already taken.'],
      },
    });
  });

  it('should return UNPROCESSABLE_ENTITY if email is already taken', async () => {
    (getUserByEmail as Mock).mockResolvedValueOnce({ email: 'test@test.com' });
    await updateCurrentUserController(req, res);
    expect(res.status).toHaveBeenCalledWith(UNPROCESSABLE_ENTITY.code);
    expect(res.send).toHaveBeenCalledWith({
      errors: {
        email: ['is already taken.'],
      },
    });
  });

  it('should return INTERNAL_SERVER_ERROR if getUserByEmail throws an error', async () => {
    (getUserByEmail as Mock).mockRejectedValueOnce(new Error('get user by name error'));
    await updateCurrentUserController(req, res);
    expect(res.status).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR.code);
    expect(res.send).toHaveBeenCalledWith({
      error: 'Cannot update user details',
      details: new Error('get user by name error'),
    });
  });

  it('should return INTERNAL_SERVER_ERROR if updateUserByEmail throws an error', async () => {
    (updateUserByEmail as Mock).mockRejectedValueOnce(new Error('update error'));
    await updateCurrentUserController(req, res);
    expect(res.status).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR.code);
    expect(res.send).toHaveBeenCalledWith({
      error: 'Cannot update user details',
      details: new Error('update error'),
    });
  });

  it('should update user details and return updated user if no errors occur', async () => {
    const updatedUser = { username: 'test', email: 'test@test.com' };
    (updateUserByEmail as Mock).mockResolvedValueOnce(updatedUser);
    await updateCurrentUserController(req, res);
    expect(res.send).toHaveBeenCalledWith({ user: updatedUser });
  });
});
