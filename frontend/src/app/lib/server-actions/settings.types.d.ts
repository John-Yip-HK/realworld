type UpdateUserBody = {
  user: {
    email: string | null;
    username: string | null;
    password: string | null;
    image: string | null;
    bio: string | null;
  };
};

type UpdateUserResponse = UserBody | ResponseError;
