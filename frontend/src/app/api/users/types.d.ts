interface User {
  username: string;
  email: string;
  password: string;
}

type UserMetadata = Pick<User, 'username' | 'email'> & {
  token: string;
  bio: string | null;
  image: string;
};

type AuthError = Record<string, string[]>
type AuthErrorResponse = {
  errors: AuthError;
}
type SuccessResponse = {
  user: UserMetadata;
}

/* Sign up user types */
type SignUpUserResponse = SuccessResponse | AuthErrorResponse;

/* Log in user types */
type LogInCredentials = Pick<User, 'email' | 'password'>;
type LogInUserResponse = SuccessResponse | AuthErrorResponse;
