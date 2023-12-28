import { type Users } from '@prisma/client';
import { type User } from '../routes/User';

export function handleUserResponse(user: Users, token: User['token']) {
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

export function handleProfileResponse(user: Users, following: boolean) {
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
