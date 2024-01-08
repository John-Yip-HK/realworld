import { type Response, type Request } from 'express';

import statusCodes from '../constants/status-codes';

import { handleUserResponse, hasFollowedUsers } from '../utils/handleUserResponseUtils';
import { hashPassword } from '../utils/passwordUtils';
import { signJwt } from '../utils/jwtUtils';
import { getUserByEmail, getUserByUsername, updateUserByEmail } from '../dao/usersDao';

import { type UserReqBody, type UserResponse } from '../routes/User';

const { BAD_REQUEST, UNPROCESSABLE_ENTITY, INTERNAL_SERVER_ERROR } = statusCodes;

function getCurrentUserController(
  req: Request<void, UserResponse, void>,
  res: Response<UserResponse>
) {
  const currentUser = req.user!;
  const otherFields = hasFollowedUsers(currentUser) ? (() => {
    const { followedUsers, ...filteredFields } = currentUser;
    return filteredFields;
  })() : currentUser;
  
  return res.send({ user: otherFields, });
}

async function updateCurrentUserController(
  req: Request<void, UserResponse, UserReqBody>,
  res: Response<UserResponse>
) {
  const { body: newUserDetails, user } = req;
  const { email, token } = user!;

  if (!newUserDetails || !newUserDetails.user) {
    return res.status(BAD_REQUEST.code).send({
      errors: {
        newUser: ['no details'],
      },
    });
  }

  const sanitisedNewUserDetails = Object.fromEntries(
    Object
      .entries(newUserDetails.user)
      .filter(([key, value]) => key === 'bio' || Boolean(value))
  );
  const isUsernameChanged = 'username' in sanitisedNewUserDetails && Boolean(sanitisedNewUserDetails.username);
  const isEmailChanged = 'email' in sanitisedNewUserDetails && Boolean(sanitisedNewUserDetails.email);
  const isPasswordChanged = 'password' in sanitisedNewUserDetails && Boolean(sanitisedNewUserDetails.password);

  try {
    const [userWithSameUsername, userWithSameEmail] = await Promise.all([
      isUsernameChanged ? getUserByUsername(sanitisedNewUserDetails.username!) : null,
      isEmailChanged ? getUserByEmail(sanitisedNewUserDetails.email!) : null,
    ]);

    if (userWithSameUsername) {
      return res.status(UNPROCESSABLE_ENTITY.code).send({
        errors: {
          username: ['is already taken.'],
        }
      });
    }

    if (userWithSameEmail) {
      return res.status(UNPROCESSABLE_ENTITY.code).send({
        errors: {
          email: ['is already taken.'],
        }
      });
    }
    
    if (isPasswordChanged) {
      const newHashedPassword = await hashPassword(sanitisedNewUserDetails.password!);
      delete sanitisedNewUserDetails['password'];
      sanitisedNewUserDetails.hashedPassword = newHashedPassword;
    }
    
    const updateUserResult = await updateUserByEmail(email, sanitisedNewUserDetails);

    let tokenToBeReturned = token;

    if (isEmailChanged) {
      tokenToBeReturned = signJwt({ email: updateUserResult.email });
    }
    
    return res.send(handleUserResponse(updateUserResult, tokenToBeReturned));
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR.code).send({
      error: 'Cannot update user details',
      details: error,
    })
  }
}

export { updateCurrentUserController, getCurrentUserController }
