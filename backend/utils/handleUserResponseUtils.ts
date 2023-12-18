import { type Users } from '@prisma/client';
import type { User } from '../routes/User';

export function handleUserResponse(user: Users, token: User['token']) {
  const { id, hashedPassword, ...otherFields } = user;
  
  return {
    user: { token, ...otherFields },
  };
}