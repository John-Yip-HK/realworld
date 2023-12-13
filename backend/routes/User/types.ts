interface User {
  email: string;
  token: string;
  username: string;
  bio: string | null;
  image: Nullable<string>;
}

interface UserCredentials extends Pick<User, 'email' | 'username'> {
  password: string;
}

type ErrorsObj = Record<string, string[]>;

type UserResponse = {
  user: User;
} | ({
  error: string;
} & Record<string, unknown>) | {
  errors: ErrorsObj;
};

export { User, UserResponse, UserCredentials, ErrorsObj }
