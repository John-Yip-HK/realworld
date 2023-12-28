import { type Request, type Response } from 'express';

import { getUserByEmail, getUserByUsername, updateUserByEmail } from '../dao/usersDao';
import { handleProfileResponse } from '../utils/handleUserResponseUtils';
import type { ProfileRequest, ProfileResponse } from '../routes/Profile';
import statusCodes from '../constants/status-codes';

import { type User } from '../routes/User';

const { INTERNAL_SERVER_ERROR, NOT_FOUND, UNPROCESSABLE_ENTITY } = statusCodes;

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
        details: 'Seeking user does not exist.',
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

export async function followUser(
  req: Request<Pick<User, 'username'>>,
  res: Response,
) {
  try {
    const { params, user } = req;
    const { email: currentUserEmail, username: currentUserUsername } = user!;
    const { username: usernameOfUserToBeFollowed } = params;

    if (currentUserUsername === usernameOfUserToBeFollowed) {
      return res.status(UNPROCESSABLE_ENTITY.code).send({
        errors: {
          username: ['cannot follow yourself.'],
        }
      });
    }

    const foundUser = await getUserByUsername(usernameOfUserToBeFollowed);

    if (foundUser === null) {
      return res.status(NOT_FOUND.code).send({
        error: NOT_FOUND.message,
        details: 'Seeking user does not exist.',
      });
    }

    const currentUser = await getUserByEmail(currentUserEmail);

    if (currentUser === null) {
      return res.status(NOT_FOUND.code).send({
        error: NOT_FOUND.message,
        details: 'Current user does not exist.',
      });
    }

    const { followedUsers } = currentUser;

    const updatedCurrentUser = await updateUserByEmail(currentUserEmail, { 
      followedUsers: followedUsers.concat(foundUser.id), 
    });

    const updateSuccessful = updatedCurrentUser.followedUsers.includes(foundUser.id);

    return res.send(handleProfileResponse(foundUser, updateSuccessful));
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR.code).send({
      error: INTERNAL_SERVER_ERROR.message,
      details: error,
    });
  }
}

export async function unfollowUser(
  req: Request<Pick<User, 'username'>>,
  res: Response,
) {
  try {
    const { params, user } = req;
    const { email: currentUserEmail, username: currentUserUsername } = user!;
    const { username: usernameOfUserToBeFollowed } = params;

    if (currentUserUsername === usernameOfUserToBeFollowed) {
      return res.status(UNPROCESSABLE_ENTITY.code).send({
        errors: {
          username: ['cannot unfollow yourself.'],
        }
      });
    }

    const foundUser = await getUserByUsername(usernameOfUserToBeFollowed);

    if (foundUser === null) {
      return res.status(NOT_FOUND.code).send({
        error: NOT_FOUND.message,
        details: 'Seeking user does not exist.',
      });
    }

    const currentUser = await getUserByEmail(currentUserEmail);

    if (currentUser === null) {
      return res.status(NOT_FOUND.code).send({
        error: NOT_FOUND.message,
        details: 'Current user does not exist.',
      });
    }

    const { followedUsers } = currentUser;

    const updatedCurrentUser = await updateUserByEmail(currentUserEmail, { 
      followedUsers: followedUsers
        .filter(idOfFollowedUser => 
          idOfFollowedUser !== foundUser.id
        ), 
    });

    const unfollowResult = updatedCurrentUser.followedUsers.includes(foundUser.id);

    return res.send(handleProfileResponse(foundUser, unfollowResult));
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR.code).send({
      error: INTERNAL_SERVER_ERROR.message,
      details: error,
    });
  }
}
