import { type Users } from '@prisma/client';
import type { ErrorResponse } from '../../globals';

type User = Omit<Users, 'id' | 'hashedPassword' | 'followedUsers'> & {
  token: string;
};

type AmendableUserFields = Omit<Users, 'id'>;

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
