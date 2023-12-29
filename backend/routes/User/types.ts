import { type User as PrismaUser } from '@prisma/client';
import type { ErrorResponse } from '../../globals';

type User = Omit<PrismaUser, 'id' | 'hashedPassword' | 'followedUsers'> & {
  token: string;
};

type AmendableUserFields = Omit<PrismaUser, 'id'>;

interface UserCredentials extends Pick<User, 'email' | 'username'> {
  password: string;
}

type UserReqBody = {
  user: Partial<User & Pick<UserCredentials, 'password'>>;
};
type UserResBody = {
  user: User;
}

type UserResponse = UserResBody | ErrorResponse;

export { 
  User, 
  UserResBody, 
  UserReqBody, 
  UserResponse, 
  UserCredentials,
  AmendableUserFields,
}
