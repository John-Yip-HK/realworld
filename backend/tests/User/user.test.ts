import type { Request, Response } from 'express';
import type { User as PrismaUser } from '@prisma/client';

import { getCurrentUserController, updateCurrentUserController } from '../../controllers/userController';
import * as handleUserResponseUtils from '../../utils/handleUserResponseUtils';
import prisma from '../../prisma/__mocks__/client';
import * as jwt from '../../__mocks__/jsonwebtoken';
import { password } from '../../__mocks__/bun';

import statusCodes from '../../constants/status-codes';

import type { UserReqBody, UserResponse } from '../../routes/User';

const { BAD_REQUEST, UNPROCESSABLE_ENTITY, INTERNAL_SERVER_ERROR } = statusCodes;

describe('getCurrentUserController', async () => {
  let req: Request<void, UserResponse, void>;
  let res: Response<UserResponse>;
  const resultingObject = {
    user: {
      name: 'John Doe',
      email: 'john@example.com',
    },
  };

  beforeEach(async () => {
    req = {
      user: {
        followedUsers: ['user1', 'user2'],
        name: 'John Doe',
        email: 'john@example.com',
      },
    } as unknown as Request<void, UserResponse, void>;

    res = {
      send: vi.fn(),
    } as unknown as Response<UserResponse>;

    vi.spyOn(handleUserResponseUtils, 'hasFollowedUsers');
  })
  
  test('should return current user with filtered fields if user has followed users', () => {
    getCurrentUserController(req, res);

    expect(handleUserResponseUtils.hasFollowedUsers).toHaveBeenCalledWith(req.user);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith(resultingObject);
  });

  test('should return current user without filtering if user has no followed users', () => {
    delete (req.user! as any).followedUsers;
    
    getCurrentUserController(req, res);

    expect(handleUserResponseUtils.hasFollowedUsers).toHaveBeenCalledWith(req.user);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith(resultingObject);
  });
});

describe('updateCurrentUserController', () => {
  let req: Request<void, UserResponse, UserReqBody>;
  let res: Response<UserResponse>;
  let originalUser: PrismaUser;

  beforeEach(() => {
    req = {
      body: {
        user: {
          username: 'updatedTest',
          email: 'updatedTest@test.com',
          password: 'updatedPassword',
        },
      },
      user: {
        username: 'test',
        email: 'test@test.com',
        token: 'token',
      },
    } as unknown as Request<void, UserResponse, UserReqBody>;

    res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as Response<UserResponse>;

    originalUser = { 
      id: 1,
      username: 'test',
      email: 'test@test.com',
      hashedPassword: 'hashedPassword',
      bio: null,
      image: 'image',
      followedUsers: [],
    };
  });

  it('should return BAD_REQUEST if newUserDetails or newUserDetails.user is not provided', async () => {
    delete (req as any).body;

    await updateCurrentUserController(req, res);

    expect(res.status).toHaveBeenCalledWith(BAD_REQUEST.code);
    expect(res.send).toHaveBeenCalledWith({
      errors: {
        newUser: ['no details'],
      },
    });

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
    prisma.user.findUnique.mockResolvedValueOnce(originalUser);

    await updateCurrentUserController(req, res);

    expect(res.status).toHaveBeenCalledWith(UNPROCESSABLE_ENTITY.code);
    expect(res.send).toHaveBeenCalledWith({
      errors: {
        username: ['is already taken.'],
      },
    });
  });

  it('should return UNPROCESSABLE_ENTITY if email is already taken', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(originalUser);
    
    await updateCurrentUserController(req, res);

    expect(res.status).toHaveBeenCalledWith(UNPROCESSABLE_ENTITY.code);
    expect(res.send).toHaveBeenCalledWith({
      errors: {
        email: ['is already taken.'],
      },
    });
  });

  it.only('should return UNPROCESSABLE_ENTITY if password in request body is the same as password of the current user', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ hashedPassword: 'hashedPassword' } as PrismaUser);
    password.verify.mockResolvedValueOnce(true);
    
    await updateCurrentUserController(req, res);

    expect(password.verify).toHaveBeenCalledOnce();
    expect(password.verify).toHaveBeenCalledWith(req.body.user.password, 'hashedPassword');

    expect(res.status).toHaveBeenCalledWith(UNPROCESSABLE_ENTITY.code);
    expect(res.send).toHaveBeenCalledWith({
      errors: {
        password: ['cannot be the same as the current password.'],
      },
    });
  });

  it('should return INTERNAL_SERVER_ERROR if getUserByEmail throws an error', async () => {
    prisma.user.findUnique.mockRejectedValueOnce(new Error('get user by name error'));

    await updateCurrentUserController(req, res);

    expect(res.status).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR.code);
    expect(res.send).toHaveBeenCalledWith({
      error: 'Cannot update user details',
      details: new Error('get user by name error'),
    });
  });

  it('should return INTERNAL_SERVER_ERROR if updateUserByEmail throws an error', async () => {
    password.verify.mockResolvedValueOnce(false);
    password.hash.mockResolvedValueOnce('dummyHashedPassword');

    prisma.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValue({
        id: 1,
        username: 'test',
        email: 'test@example.com',
        hashedPassword: 'dummyHashedPassword',
        bio: null,
        image: '',
        followedUsers: [],
      });
    prisma.user.update.mockRejectedValueOnce(new Error('update error'));

    await updateCurrentUserController(req, res);

    expect(res.status).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR.code);
    expect(res.send).toHaveBeenCalledWith({
      error: 'Cannot update user details',
      details: new Error('update error'),
    });
  });

  it('should update user details, return updated user and return new authentication token when email is updated', async () => {
    const dummyNewToken = 'dummyNewToken';
    const updatedUser = req.body.user;

    delete updatedUser.password;

    prisma.user.update.mockResolvedValueOnce(updatedUser as PrismaUser);
    jwt.sign.mockImplementationOnce(() => dummyNewToken);
    vi.spyOn(handleUserResponseUtils, 'handleUserResponse');

    await updateCurrentUserController(req, res);

    expect(jwt.sign.mock.calls[0][0]).toStrictEqual({ email: updatedUser.email });
    expect(handleUserResponseUtils.handleUserResponse).toHaveBeenCalledWith(updatedUser, dummyNewToken);
  });

  it('should update user details, return updated user and return the original authentication token when email is not changed', async () => {
    const updatedUser = req.body.user;
    delete updatedUser.email;
    delete updatedUser.password;

    prisma.user.update.mockResolvedValueOnce(updatedUser as PrismaUser);
    vi.spyOn(handleUserResponseUtils, 'handleUserResponse');

    await updateCurrentUserController(req, res);

    expect(jwt.sign).toHaveBeenCalledTimes(0);
    expect(handleUserResponseUtils.handleUserResponse).toHaveBeenCalledWith(updatedUser, req.user?.token);
  });
});
