import type { User as PrismaUser } from '@prisma/client';

import { getCurrentUser } from '../../controllers/articles/utils';
import prisma from '../../prisma/__mocks__/client';

describe('getCurrentUser', () => {
  it('should return the current user when the user exists', async () => {
    const user: PrismaUser = {
      id: 1,
      email: 'test@test.com',
      username: 'test',
      hashedPassword: 'hashedPassword',
      bio: 'bio',
      image: 'image',
      followedUsers: [2],
    };

    prisma.user.findUnique.mockResolvedValue(user);

    const result = await getCurrentUser('test@test.com');

    expect(result).toEqual(user);
  });

  it('should return null when the user does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const result = await getCurrentUser('test@test.com');
    
    expect(result).toBeNull();
  });

  it('should return null when email is not provided', async () => {
    expect(await getCurrentUser()).toBeNull();
  });
});