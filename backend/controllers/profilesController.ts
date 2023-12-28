import { type Request, type Response } from 'express';
import { type Users } from '@prisma/client';

import { getUserByEmail, getUserByUsername } from '../dao/usersDao';
import { handleProfileResponse } from '../utils/handleUserResponseUtils';
import type { ProfileRequest, ProfileResponse } from '../routes/Profile';
import statusCodes from '../constants/status-codes';

const { INTERNAL_SERVER_ERROR, NOT_FOUND } = statusCodes;

export async function getProfileByUsername(
  req: ProfileRequest,
  res: Response<ProfileResponse>,
) {
  try {
    const { currentUserEmail, params } = req;
    const { username } = params;

    let currentUserIsFollowingFoundUser = false;
    
    const foundUser = await getUserByUsername(username);

    if (foundUser === null) {
      return res.status(NOT_FOUND.code).send({
        error: NOT_FOUND.message,
      });
    }

    if (currentUserEmail) {
      const currentUser = await getUserByEmail(currentUserEmail);

      if (currentUser === null) {
        return res.status(NOT_FOUND.code).send({
          error: NOT_FOUND.message,
          details: 'Current user does not exist.',
        });
      }

      currentUserIsFollowingFoundUser = currentUser.followedUsers.includes(foundUser.id);
    }

    return res.send(handleProfileResponse(foundUser, currentUserIsFollowingFoundUser));
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR.code).send({
      error: INTERNAL_SERVER_ERROR.message,
      details: error,
    });
  }
}
