interface UnauthorizedError {
  status: "error";
  message: "missing authorization credentials";
};

interface UnexpectedError {
  errors: Record<string, string[]>;
};

type ServerError = string;
type ResponseError = UnauthorizedError | UnexpectedError;
type ConduitApiError = ResponseError | ServerError;

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

type GetUserResponse = UserBody | ResponseError;
