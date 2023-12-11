interface User {
  email: string;
  token: string;
  username: string;
  bio: string;
  image: Nullable<string>;
}

interface UserCredentials extends Pick<User, 'email' | 'username'> {
  password: string;
}

interface UserResponse {
  user: User;
};

export { User, UserResponse, UserCredentials }
