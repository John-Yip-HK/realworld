import { type Users } from '@prisma/client';
import type { ErrorResponse } from '../../globals';

type User = Omit<Users, 'id' | 'hashedPassword'> & {
  token: string;
};

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

export { User, UserResBody, UserReqBody, UserResponse, UserCredentials }
