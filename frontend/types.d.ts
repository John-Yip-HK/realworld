type User = {
  username: string;
  email: string;
  password: string;
}

type SignInCredentials = Omit<User, 'username'>;