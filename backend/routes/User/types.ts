interface User {
  email: string;
  token: string;
  username: string;
  bio: string;
  image: Nullable<string>;
}

interface UserResponse {
  user: User;
};

export { User, UserResponse }
