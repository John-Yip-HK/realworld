type User = {
  username: string;
  email: string;
  password: string;
}

type SignInCredentials = Omit<User, 'username'>;

type SignUpUserError = Partial<Record<keyof User, string[]>>;
type SignUpUserErrorResponse = {
  errors: SignUpUserError;
}

type SignUpUserSuccess = Omit<User, 'password'> & {
  token: string;
  bio: string;
  image: string;
};
type SignUpUserSuccessResponse = {
  user: SignUpUserSuccess;
}

type SignUpUserResponse = SignUpUserSuccessResponse | SignUpUserErrorResponse;