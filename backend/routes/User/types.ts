interface User {
  user: {
    email: string;
    token: string;
    username: string;
    bio: string;
    image: Nullable<string>;
  }
};

export {
  User,
}
