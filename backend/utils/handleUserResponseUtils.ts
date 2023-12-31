import { type User as PrismaUser } from '@prisma/client';
import { type User } from '../routes/User';

export function handleUserResponse(user: PrismaUser, token: User['token']) {
  const { 
    id, 
    hashedPassword, 
    followedUsers, 
    ...otherFields
  } = user;
  
  return {
    user: { token, ...otherFields },
  };
}

export function handleProfileResponse(user: PrismaUser, following: boolean) {
  const { 
    id, 
    hashedPassword, 
    followedUsers, 
    email, 
    ...otherFields
  } = user;

  return {
    profile: {
      ...otherFields,
      following,
    },
  };
}
