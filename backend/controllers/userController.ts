import { type Response, type Request } from 'express';
import { PrismaClient } from '@prisma/client';

import statusCodes from '../constants/status-codes';

import { handleUserResponse } from '../utils/handleUserResponseUtils';
import { hashPassword } from '../utils/passwordUtils';
import { signJwt } from '../utils/jwtUtils';

import { type UserReqBody, type UserResponse } from '../routes/User';

const { BAD_REQUEST, UNPROCESSABLE_ENTITY, INTERNAL_SERVER_ERROR } = statusCodes;

const prisma = new PrismaClient();

async function updateCurrentUserController(
  req: Request<void, UserResponse, UserReqBody>,
  res: Response<UserResponse>
) {
  const { body: newUserDetails, user } = req;
  const { email, token } = user!;

  if (!newUserDetails || !newUserDetails.user) {
    return res.status(BAD_REQUEST.code).send({
      error: 'No new user details.',
    });
  }

  const sanitisedNewUserDetails = Object.fromEntries(
    Object.entries(newUserDetails.user).filter(([, value]) => Boolean(value))
  );
  const isUsernameChanged = 'username' in sanitisedNewUserDetails && Boolean(sanitisedNewUserDetails.username);
  const isEmailChanged = 'email' in sanitisedNewUserDetails && Boolean(sanitisedNewUserDetails.email);
  const isPasswordChanged = 'password' in sanitisedNewUserDetails && Boolean(sanitisedNewUserDetails.password);

  try {
    // If duplicate username or email is found, return 422 error inducating the duplication.
    const [numUsersWithSameUsername, numUsersWithSameEmail] = await Promise.all([
      isUsernameChanged ? prisma.users.count({
        where: {
          username: sanitisedNewUserDetails.username!,
        }
      }) : 0,
      isEmailChanged ? prisma.users.count({
        where: {
          email: sanitisedNewUserDetails.email!,
        }
      }) : 0,
    ]);

    if (numUsersWithSameUsername > 0) {
      return res.status(UNPROCESSABLE_ENTITY.code).send({
        errors: {
          username: ['is already taken.'],
        }
      });
    }

    if (numUsersWithSameEmail > 0) {
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
    
    const updateUserResult = await prisma.users.update({
      where: { email },
      data: sanitisedNewUserDetails,
    });

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

export { updateCurrentUserController }
