interface UnauthorizedError {
  status: "error";
  message: "missing authorization credentials";
};

interface UnexpectedError {
  errors: Record<string, string[]>;
};

type ServerError = string;
type ExpectedError = UnauthorizedError | UnexpectedError;
type ConduitApiError = ExpectedError | ServerError;

interface UserCredentials {
  username: string;
  email: string;
  password: string;
}

type User = Pick<UserCredentials, 'username' | 'email'> & {
  token: string;
  bio: string | null;
  image: string;
};

type UserBody = {
  user: User;
}

type GetUserResponse = UserBody | Exclude<ConduitApiError, ServerError>;
