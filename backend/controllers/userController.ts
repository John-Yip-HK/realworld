import { type Response, type Request } from 'express';

import statusCodes from '../constants/status-codes';

import { handleUserResponse, hasFollowedUsers } from '../utils/handleUserResponseUtils';
import { comparePassword, hashPassword } from '../utils/passwordUtils';
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
  
  return res.send({ user: otherFields });
}

async function updateCurrentUserController(
  req: Request<void, UserResponse, UserReqBody>,
  res: Response<UserResponse>
) {
  const { body: newUserDetails, user } = req;
  const { email, token, username } = user!;

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
  const isUsernameChanged = 
    'username' in sanitisedNewUserDetails && 
    Boolean(sanitisedNewUserDetails.username) &&
    sanitisedNewUserDetails.username !== username;
  const isEmailChanged = 
    'email' in sanitisedNewUserDetails &&
    Boolean(sanitisedNewUserDetails.email) &&
    sanitisedNewUserDetails.email !== email;
  const isTryingToChangePassword = 
    'password' in sanitisedNewUserDetails && 
    Boolean(sanitisedNewUserDetails.password);

  if (!isUsernameChanged) {
    delete sanitisedNewUserDetails.username;
  }

  if (!isEmailChanged) {
    delete sanitisedNewUserDetails.email;
  }

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
    
    if (isTryingToChangePassword) {
      const newPassword = sanitisedNewUserDetails.password!;
      const currentUser = await getUserByEmail(email);
      const currentUserHashedPassword = currentUser!.hashedPassword;
      const isNewPasswordTheSameAsCurrentPassword = await comparePassword(newPassword, currentUserHashedPassword)
      
      if (isNewPasswordTheSameAsCurrentPassword) {
        return res.status(UNPROCESSABLE_ENTITY.code).send({
          errors: {
            password: ['cannot be the same as the current password.'],
          },
        });
      }
      else {
        const newHashedPassword = await hashPassword(newPassword);

        sanitisedNewUserDetails.hashedPassword = newHashedPassword;
        
        delete sanitisedNewUserDetails.password;
      }
    }
    
    const updateUserResult = await updateUserByEmail(email, sanitisedNewUserDetails);
    const tokenToBeReturned = isEmailChanged ? signJwt({ email: updateUserResult.email }) : token;

    return res.send(handleUserResponse(updateUserResult, tokenToBeReturned));
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR.code).send({
      error: 'Cannot update user details',
      details: error,
    })
  }
}

export { updateCurrentUserController, getCurrentUserController }
