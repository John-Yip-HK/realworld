import { type Users } from '@prisma/client';
import { type Request } from 'express';

import type { ErrorResponse } from '../../globals';

type Profile = Pick<Users, 'username' | 'bio' | 'image'> & {
  following: boolean;
}

interface ProfileResBody {
  profile: Profile;
}

type ProfileResponse = ProfileResBody | ErrorResponse;

interface ProfileRequest extends Request<Pick<Users, 'username'>, ProfileResponse, void> {
  currentUserEmail?: string;
}

export {
  Profile,
  ProfileResponse,
  ProfileRequest,
}
