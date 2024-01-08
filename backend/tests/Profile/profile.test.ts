import type { Response } from 'express';
import type { Mock } from 'vitest';

import { followUser, getProfileByUsername, unfollowUser } from '../../controllers/profilesController';
import { getUserByUsername, getUserByEmail, updateUserByEmail } from '../../dao/usersDao';
import { handleProfileResponse } from '../../utils/handleUserResponseUtils';

import statusCodes from '../../constants/status-codes';

import type { ProfileRequest, ProfileResponse } from '../../routes/Profile';

const { NOT_FOUND, INTERNAL_SERVER_ERROR, UNPROCESSABLE_ENTITY } = statusCodes;

vi.mock('../../utils/handleUserResponseUtils');
vi.mock('../../dao/usersDao');

describe('getProfileByUsername', () => {
  it('should return NOT_FOUND if the user to be found does not exist', async () => {
    const req = {
      params: {
        username: 'test',
      },
      currentUserEmail: 'test@test.com',
    } as unknown as ProfileRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as Response<ProfileResponse>;
    
    (getUserByUsername as Mock).mockResolvedValueOnce(null);
    await getProfileByUsername(req, res);
    expect(res.status).toHaveBeenCalledWith(NOT_FOUND.code);
    expect(res.send).toHaveBeenCalledWith({
      error: NOT_FOUND.message,
      details: 'Seeking user does not exist.',
    });
  });

  const req = {
    params: {
      username: 'test',
    },
    currentUserEmail: 'test@test.com',
  } as unknown as ProfileRequest;

  const res = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn(),
  } as unknown as Response<ProfileResponse>;

  it('should return NOT_FOUND if the current user does not exist', async () => {
    (getUserByUsername as Mock).mockResolvedValueOnce({ id: '1', username: 'test', email: 'test@test.com' });
    (getUserByEmail as Mock).mockResolvedValueOnce(null);
    await getProfileByUsername(req, res);
    expect(res.status).toHaveBeenCalledWith(NOT_FOUND.code);
    expect(res.send).toHaveBeenCalledWith({
      error: NOT_FOUND.message,
      details: 'Current user does not exist.',
    });
  });

  it('should return INTERNAL_SERVER_ERROR if an error occurs', async () => {
    (getUserByUsername as Mock).mockRejectedValueOnce(new Error('get error'));
    await getProfileByUsername(req, res);
    expect(res.status).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR.code);
    expect(res.send).toHaveBeenCalledWith({
      error: INTERNAL_SERVER_ERROR.message,
      details: new Error('get error'),
    });
  });

  it('should return the profile of the user to be found if no errors occur', async () => {
    const foundUser = { 
      id: '1', 
      username: 'test', 
      email: 'test@test.com', 
      bio: null, 
      image: '',
    };
    const currentUser = { id: '2', username: 'test2', email: 'test2@test.com', followedUsers: ['1'] };
    (getUserByUsername as Mock).mockResolvedValueOnce(foundUser);
    (getUserByEmail as Mock).mockResolvedValueOnce(currentUser);
    await getProfileByUsername(req, res);
    expect(handleProfileResponse).toHaveBeenCalledWith(foundUser, true);
  });
});

describe('followUser', () => {
  const req = {
    params: {
      username: 'test',
    },
    user: {
      email: 'test@test.com',
      username: 'test2',
    },
  } as unknown as ProfileRequest;

  const res = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn(),
  } as unknown as Response<ProfileResponse>;

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
    (req.user!).username = 'test2';
    (getUserByUsername as Mock).mockResolvedValueOnce(null);
    await followUser(req, res);
    expect(res.status).toHaveBeenCalledWith(NOT_FOUND.code);
    expect(res.send).toHaveBeenCalledWith({
      error: NOT_FOUND.message,
      details: 'Seeking user does not exist.',
    });
  });

  it('should return NOT_FOUND if the current user does not exist', async () => {
    (getUserByUsername as Mock).mockResolvedValueOnce({ id: '1', username: 'test', email: 'test@test.com' });
    (getUserByEmail as Mock).mockResolvedValueOnce(null);
    await followUser(req, res);
    expect(res.status).toHaveBeenCalledWith(NOT_FOUND.code);
    expect(res.send).toHaveBeenCalledWith({
      error: NOT_FOUND.message,
      details: 'Current user does not exist.',
    });
  });

  it('should return INTERNAL_SERVER_ERROR if an error occurs', async () => {
    (getUserByUsername as Mock).mockRejectedValueOnce(new Error('get error'));
    await followUser(req, res);
    expect(res.status).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR.code);
    expect(res.send).toHaveBeenCalledWith({
      error: INTERNAL_SERVER_ERROR.message,
      details: new Error('get error'),
    });
  });

  it('should follow the user and return the profile of the user to be followed if no errors occur', async () => {
    const foundUser = { id: '1', username: 'test', email: 'test@test.com' };
    const currentUser = { id: '2', username: 'test2', email: 'test2@test.com', followedUsers: [] };
    (getUserByUsername as Mock).mockResolvedValueOnce(foundUser);
    (getUserByEmail as Mock).mockResolvedValueOnce(currentUser);
    (updateUserByEmail as Mock).mockResolvedValueOnce({ ...currentUser, followedUsers: [foundUser.id] });
    await followUser(req, res);
    expect(handleProfileResponse).toHaveBeenCalledWith(foundUser, true);
  });
});

describe('unfollowUser', () => {
  const req = {
    params: {
      username: 'test',
    },
    user: {
      email: 'test@test.com',
      username: 'test2',
    },
  } as unknown as ProfileRequest;

  const res = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn(),
  } as unknown as Response<ProfileResponse>;

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
    (getUserByUsername as Mock).mockResolvedValueOnce(null);
    await unfollowUser(req, res);
    expect(res.status).toHaveBeenCalledWith(NOT_FOUND.code);
    expect(res.send).toHaveBeenCalledWith({
      error: NOT_FOUND.message,
      details: 'Seeking user does not exist.',
    });
  });

  it('should return NOT_FOUND if the current user does not exist', async () => {
    (getUserByUsername as Mock).mockResolvedValueOnce({ id: '1', username: 'test', email: 'test@test.com' });
    (getUserByEmail as Mock).mockResolvedValueOnce(null);
    await unfollowUser(req, res);
    expect(res.status).toHaveBeenCalledWith(NOT_FOUND.code);
    expect(res.send).toHaveBeenCalledWith({
      error: NOT_FOUND.message,
      details: 'Current user does not exist.',
    });
  });

  it('should return INTERNAL_SERVER_ERROR if an error occurs', async () => {
    (getUserByUsername as Mock).mockRejectedValueOnce(new Error('get error'));
    await unfollowUser(req, res);
    expect(res.status).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR.code);
    expect(res.send).toHaveBeenCalledWith({
      error: INTERNAL_SERVER_ERROR.message,
      details: new Error('get error'),
    });
  });

  it('should unfollow the user and return the profile of the user to be unfollowed if no errors occur', async () => {
    const foundUser = { id: '1', username: 'test', email: 'test@test.com' };
    const currentUser = { id: '2', username: 'test2', email: 'test2@test.com', followedUsers: ['1'] };
    (getUserByUsername as Mock).mockResolvedValueOnce(foundUser);
    (getUserByEmail as Mock).mockResolvedValueOnce(currentUser);
    (updateUserByEmail as Mock).mockResolvedValueOnce({ ...currentUser, followedUsers: [] });
    await unfollowUser(req, res);
    expect(handleProfileResponse).toHaveBeenCalledWith(foundUser, false);
  });
});
