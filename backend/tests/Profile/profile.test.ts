import type { Response } from 'express';
import type { Mock } from 'vitest';

import { followUser, getProfileByUsername, unfollowUser } from '../../controllers/profilesController';
import { getUserByUsername, getUserByEmail, updateUserByEmail } from '../../dao/usersDao';
import { handleProfileResponse } from '../../utils/handleUserResponseUtils';
import prisma from '../../prisma/__mocks__/client';

import statusCodes from '../../constants/status-codes';

import type { ProfileRequest, ProfileResponse } from '../../routes/Profile';

const { NOT_FOUND, INTERNAL_SERVER_ERROR, UNPROCESSABLE_ENTITY, BAD_REQUEST } = statusCodes;

vi.mock('../../utils/handleUserResponseUtils');

describe('getProfileByUsername', () => {
  let req: ProfileRequest;
  let res: Response<ProfileResponse>;

  beforeEach(() => {
    req = {
      params: {
        username: 'test',
      },
      currentUserEmail: 'current@user.com',
    } as unknown as ProfileRequest;

    res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as Response<ProfileResponse>;
  })
  
  it('should return NOT_FOUND if the user to be found does not exist', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);

    await getProfileByUsername(req, res);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        username: req.params.username,
      },
    });
    expect(res.status).toHaveBeenCalledWith(NOT_FOUND.code);
    expect(res.send).toHaveBeenCalledWith({
      error: NOT_FOUND.message,
      details: 'Seeking user does not exist.',
    });
  });

  it('should return NOT_FOUND if the current user does not exist', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({ 
        id: 1, 
        username: 'test', 
        email: 'test@test.com',
        hashedPassword: '',
        bio: null,
        image: '',
        followedUsers: [],
      })
      .mockResolvedValueOnce(null);

    await getProfileByUsername(req, res);

    expect(prisma.user.findUnique).toHaveBeenCalledTimes(2);
    expect(prisma.user.findUnique.mock.lastCall).toBeDefined();
    expect(prisma.user.findUnique.mock.lastCall![0]).toStrictEqual({
      where: {
        email: req.currentUserEmail,
      },
    });

    expect(res.status).toHaveBeenCalledWith(NOT_FOUND.code);
    expect(res.send).toHaveBeenCalledWith({
      error: NOT_FOUND.message,
      details: 'Current user does not exist.',
    });
  });

  it('should return INTERNAL_SERVER_ERROR if an error occurs', async () => {
    prisma.user.findUnique.mockRejectedValueOnce(new Error('get error'));

    await getProfileByUsername(req, res);

    expect(res.status).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR.code);
    expect(res.send).toHaveBeenCalledWith({
      error: INTERNAL_SERVER_ERROR.message,
      details: new Error('get error'),
    });
  });

  it('should return the profile of the user to be found if current user is following the found user', async () => {
    const foundUser = { 
      id: 1, 
      username: 'test', 
      email: 'test@test.com', 
      bio: null, 
      image: '',
      hashedPassword: '',
      followedUsers: [],
    };
    const currentUser = { 
      id: 2, 
      username: 'test2', 
      email: 'test2@test.com', 
      followedUsers: [1],
      hashedPassword: '',
      bio: null,
      image: '',
    };

    prisma.user.findUnique
      .mockResolvedValueOnce(foundUser)
      .mockResolvedValueOnce(currentUser);

    await getProfileByUsername(req, res);
    expect(handleProfileResponse).toHaveBeenCalledWith(foundUser, true);
  });

  it('should return the profile of the user to be found if current user is not following the found user', async () => {
    const foundUser = { 
      id: 1, 
      username: 'test', 
      email: 'test@test.com', 
      bio: null, 
      image: '',
      hashedPassword: '',
      followedUsers: [],
    };
    const currentUser = { 
      id: 2, 
      username: 'test2', 
      email: 'test2@test.com', 
      followedUsers: [],
      hashedPassword: '',
      bio: null,
      image: '',
    };

    prisma.user.findUnique
      .mockResolvedValueOnce(foundUser)
      .mockResolvedValueOnce(currentUser);

    await getProfileByUsername(req, res);
    expect(handleProfileResponse).toHaveBeenCalledWith(foundUser, false);
  });
});

describe('followUser', () => {
  let req: ProfileRequest;
  let res: Response<ProfileResponse>;
  
  beforeEach(() => {
    req = {
      params: {
        username: 'test',
      },
      user: {
        email: 'test@test.com',
        username: 'test2',
      },
    } as unknown as ProfileRequest;
  
    res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as Response<ProfileResponse>;
  })

  it('should return UNPROCESSABLE_ENTITY if the current user tries to follow themselves', async () => {
    (req.user!).username = 'test';

    await followUser(req, res);

    expect(res.status).toHaveBeenCalledWith(UNPROCESSABLE_ENTITY.code);
    expect(res.send).toHaveBeenCalledWith({
      errors: {
        username: ['cannot follow yourself.'],
      },
    });
  });

  it('should return NOT_FOUND if the user to be followed does not exist', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);

    await followUser(req, res);

    expect(res.status).toHaveBeenCalledWith(NOT_FOUND.code);
    expect(res.send).toHaveBeenCalledWith({
      error: NOT_FOUND.message,
      details: 'Seeking user does not exist.',
    });
  });

  it('should return NOT_FOUND if the current user does not exist', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({ 
        id: 1, 
        username: 'test', 
        email: 'test@test.com', 
        hashedPassword: '',
        bio: null,
        image: '',
        followedUsers: [],
      })
      .mockResolvedValueOnce(null);

    await followUser(req, res);

    expect(res.status).toHaveBeenCalledWith(NOT_FOUND.code);
    expect(res.send).toHaveBeenCalledWith({
      error: NOT_FOUND.message,
      details: 'Current user does not exist.',
    });
  });

  it('should return INTERNAL_SERVER_ERROR if an error occurs', async () => {
    prisma.user.findUnique.mockRejectedValueOnce(new Error('get error'));

    await followUser(req, res);

    expect(res.status).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR.code);
    expect(res.send).toHaveBeenCalledWith({
      error: INTERNAL_SERVER_ERROR.message,
      details: new Error('get error'),
    });
  });

  it('should follow the user and return the profile of the followed user if no errors occur', async () => {
    const foundUser = { 
      id: 1, 
      username: 'test', 
      email: 'test@test.com', 
      hashedPassword: '',
      bio: null,
      image: '',
      followedUsers: [],
    };
    const currentUser = { 
      id: 2, 
      username: 'test2', 
      email: 'test2@test.com', 
      hashedPassword: '',
      bio: null,
      image: '',
      followedUsers: [],
    };

    prisma.user.findUnique
      .mockResolvedValueOnce(foundUser)
      .mockResolvedValueOnce(currentUser);
    prisma.user.update.mockResolvedValueOnce({
      ...currentUser, 
      followedUsers: [foundUser.id],
    });

    await followUser(req, res);

    expect(handleProfileResponse).toHaveBeenCalledWith(foundUser, true);
  });

  it('should throw a BAD_REQUEST error if follow user is unsuccessful', async () => {
    const foundUser = { 
      id: 1, 
      username: 'test', 
      email: 'test@test.com', 
      hashedPassword: '',
      bio: null,
      image: '',
      followedUsers: [],
    };
    const currentUser = { 
      id: 2, 
      username: 'test2', 
      email: 'test2@test.com', 
      hashedPassword: '',
      bio: null,
      image: '',
      followedUsers: [],
    };

    prisma.user.findUnique
      .mockResolvedValueOnce(foundUser)
      .mockResolvedValueOnce(currentUser);
    prisma.user.update.mockResolvedValueOnce(currentUser);

    await followUser(req, res);

    expect(res.status).toHaveBeenCalledWith(BAD_REQUEST.code);
    expect(res.send).toHaveBeenCalledWith({
      error: BAD_REQUEST.message,
      details: 'Failed to follow user for unknown reason. Please try again later.',
    });
  });
});

describe('unfollowUser', () => {
  let req: ProfileRequest;
  let res: Response<ProfileResponse>;
  
  beforeEach(() => {
    req = {
      params: {
        username: 'test',
      },
      user: {
        email: 'test@test.com',
        username: 'test2',
      },
    } as unknown as ProfileRequest;
  
    res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as Response<ProfileResponse>;
  })

  it('should return UNPROCESSABLE_ENTITY if the current user tries to unfollow themselves', async () => {
    (req.user!).username = 'test';

    await unfollowUser(req, res);

    expect(res.status).toHaveBeenCalledWith(UNPROCESSABLE_ENTITY.code);
    expect(res.send).toHaveBeenCalledWith({
      errors: {
        username: ['cannot unfollow yourself.'],
      },
    });
  });

  it('should return NOT_FOUND if the user to be unfollowed does not exist', async () => {
    (req.user!).username = 'test2';

    prisma.user.findUnique.mockResolvedValueOnce(null);
    
    await unfollowUser(req, res);
    
    expect(res.status).toHaveBeenCalledWith(NOT_FOUND.code);
    expect(res.send).toHaveBeenCalledWith({
      error: NOT_FOUND.message,
      details: 'Seeking user does not exist.',
    });
  });

  it('should return NOT_FOUND if the current user does not exist', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({ 
        id: 1, 
        username: 'test', 
        email: 'test@test.com',
        hashedPassword: '',
        bio: null,
        image: '',
        followedUsers: [],
      })
      .mockResolvedValueOnce(null);

    await unfollowUser(req, res);

    expect(res.status).toHaveBeenCalledWith(NOT_FOUND.code);
    expect(res.send).toHaveBeenCalledWith({
      error: NOT_FOUND.message,
      details: 'Current user does not exist.',
    });
  });

  it('should return INTERNAL_SERVER_ERROR if an error occurs', async () => {
    prisma.user.findUnique.mockRejectedValueOnce(new Error('get error'));

    await unfollowUser(req, res);

    expect(res.status).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR.code);
    expect(res.send).toHaveBeenCalledWith({
      error: INTERNAL_SERVER_ERROR.message,
      details: new Error('get error'),
    });
  });

  it('should unfollow the user and return the profile of the user to be unfollowed if no errors occur', async () => {
    const foundUser = { 
      id: 1, 
      username: 'test', 
      email: 'test@test.com',
      hashedPassword: '',
      bio: null,
      image: '',
      followedUsers: [],
    };
    const currentUser = { 
      id: 2,
      username: 'test2', 
      email: 'test2@test.com', 
      followedUsers: [1],
      hashedPassword: '',
      bio: null,
      image: '',
    };

    prisma.user.findUnique
      .mockResolvedValueOnce(foundUser)
      .mockResolvedValueOnce(currentUser);
    prisma.user.update.mockResolvedValueOnce({ 
      ...currentUser, 
      followedUsers: [], 
    });

    await unfollowUser(req, res);

    expect(handleProfileResponse).toHaveBeenCalledWith(foundUser, false);
  });

    it('should unfollow the user and return the profile of the user to be unfollowed if no errors occur', async () => {
    const foundUser = { 
      id: 1, 
      username: 'test', 
      email: 'test@test.com',
      hashedPassword: '',
      bio: null,
      image: '',
      followedUsers: [],
    };
    const currentUser = { 
      id: 2,
      username: 'test2', 
      email: 'test2@test.com', 
      followedUsers: [1],
      hashedPassword: '',
      bio: null,
      image: '',
    };

    prisma.user.findUnique
      .mockResolvedValueOnce(foundUser)
      .mockResolvedValueOnce(currentUser);
    prisma.user.update.mockResolvedValueOnce(currentUser);

    await unfollowUser(req, res);

    expect(res.status).toHaveBeenCalledWith(BAD_REQUEST.code);
    expect(res.send).toHaveBeenCalledWith({
      error: BAD_REQUEST.message,
      details: 'Failed to unfollow user for unknown reason. Please try again later.',
    });
  });
});
