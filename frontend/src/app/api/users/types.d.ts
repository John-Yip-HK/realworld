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

/* Sign up user types */
type SignInUserSuccessResponse = {
  user: UserMetadata;
}
type SignUpUserResponse = SignInUserSuccessResponse | AuthErrorResponse;

/* Log in user types */
type LogInUserSuccessResponse = SignInUserSuccessResponse;
type LogInCredentials = Pick<User, 'email' | 'password'>;
type LogInUserResponse = LogInUserSuccessResponse | AuthErrorResponse;
