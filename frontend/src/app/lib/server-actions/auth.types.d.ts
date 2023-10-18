type CredentialType = ReturnType<FormData['get']>;

interface User {
  username: string;
  email: string;
  password: string;
}

type NewUserCredentials = Record<keyof User, CredentialType>;

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
type LogInCredentials = Record<'email' | 'password', CredentialType>;
type LogInUserResponse = LogInUserSuccessResponse | AuthErrorResponse;
