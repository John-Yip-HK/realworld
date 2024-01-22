import { type User as PrismaUser } from '@prisma/client';
import { type User as RealworldUser } from '../../routes/User';

import { 
  handleUserResponse, 
  hasFollowedUsers, 
  handleProfileResponse 
} from '../../utils/handleUserResponseUtils';

type RealworldUserWithFollowedUsersInfo = RealworldUser & Pick<PrismaUser, 'followedUsers'>;

describe('handleUserResponse', () => {
  let user: PrismaUser;
  let token: RealworldUser['token'];
  
  beforeEach(() => {
    user = {
      id: 1,
      email: 'test@test.com',
      username: 'test',
      hashedPassword: 'hashedPassword',
      bio: 'bio',
      image: 'image',
      followedUsers: [2],
    };

    token = 'token';
  })
  
  it('should return the user response without followedUsers when needFollowedUsers is false', () => {
    const result = handleUserResponse(user, token, false);

    expect(result).toEqual({
      user: {
        token,
        email: user.email,
        username: user.username,
        bio: user.bio,
        image: user.image,
      },
    });
  });

  it('should return the user response with followedUsers when needFollowedUsers is true', () => {
    const result = handleUserResponse(user, token, true);

    expect(result).toEqual({
      user: {
        token,
        email: user.email,
        username: user.username,
        bio: user.bio,
        image: user.image,
        followedUsers: user.followedUsers,
      },
    });
  });

  it('should return the user response without followedUsers when `user` object does not have `followedUsers` attribute', () => {
    const mockUserResponse = {
      user: {
        token,
        email: user.email,
        username: user.username,
        bio: user.bio,
        image: user.image,
      },
    };

    delete (user as any).followedUsers;

    let result = handleUserResponse(user, token, true);
    expect(result).toEqual(mockUserResponse);

    result = handleUserResponse(user, token, false);
    expect(result).toEqual(mockUserResponse);
  })
});

describe('hasFollowedUsers', () => {
  it('should return true when the user has followedUsers', () => {
    const user: RealworldUserWithFollowedUsersInfo = {
      email: 'test@test.com',
      username: 'test',
      bio: 'bio',
      image: 'image',
      token: 'token',
      followedUsers: [2],
    };

    const result = hasFollowedUsers(user);

    expect(result).toBe(true);
  });

  it('should return false when the user does not have followedUsers', () => {
    const user: RealworldUser = {
      email: 'test@test.com',
      username: 'test',
      bio: 'bio',
      image: 'image',
      token: 'token',
    };

    const result = hasFollowedUsers(user);

    expect(result).toBe(false);
  });
});

describe('handleProfileResponse', () => {
  const user: PrismaUser = {
    id: 1,
    email: 'test@test.com',
    username: 'test',
    hashedPassword: 'hashedPassword',
    bio: 'bio',
    image: 'image',
    followedUsers: [2],
  };
  
  it('should return the profile response with `following` as true', () => {
    const result = handleProfileResponse(user, true);

    expect(result).toEqual({
      profile: {
        username: user.username,
        bio: user.bio,
        image: user.image,
        following: true,
      },
    });
  });

  it('should return the profile response with `following` as false', () => {
    const result = handleProfileResponse(user, false);

    expect(result).toEqual({
      profile: {
        username: user.username,
        bio: user.bio,
        image: user.image,
        following: false,
      },
    });
  });
});
