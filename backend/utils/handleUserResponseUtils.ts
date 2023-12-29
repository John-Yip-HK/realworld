import { type User } from '@prisma/client';
import { type User } from '../routes/User';

export function handleUserResponse(user: User, token: User['token']) {
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

export function handleProfileResponse(user: User, following: boolean) {
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
