interface Profile {
  username: string;
  bio: string;
  image: string;
  following: boolean;
};

interface GetProfileSuccessResponse {
  profile: Profile;
};

type GetProfileFailResponse = ConduitApiError;

type GetProfileResponse = GetProfileSuccessResponse | GetProfileFailResponse;
