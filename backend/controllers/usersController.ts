import { Request, Response } from 'express';

import { comparePassword, hashPassword } from '../utils/passwordUtils';
import { signJwt } from '../utils/jwtUtils';
import { handleUserResponse } from '../utils/handleUserResponseUtils';
import { createUser, getUserByEmail, getUserByUsername } from '../dao/usersDao';

import statusCodes from '../constants/status-codes';

import type { UserCredentials, UserResponse } from '../routes/User';
import type { ErrorsObj } from '../globals';

const { 
  BAD_REQUEST, 
  UNPROCESSABLE_ENTITY, 
  INTERNAL_SERVER_ERROR, 
  CREATED, 
  FORBIDDEN 
} = statusCodes;

/**
 * Registers a new user.
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @returns A Promise that resolves to the response status.
 */
async function registerUserController(
  req: Request<
    void, 
    UserResponse, 
    { user: UserCredentials, }
  >, 
  res: Response<UserResponse>
) {
  const { user: { email, username, password } } = req.body;
  const errorsObj: ErrorsObj = {};

  if (!email || !username || !password) {
    const errorMsg = ['can\'t be blank'];

    if (!email) { errorsObj.email = errorMsg; }
    else if (!username) { errorsObj.username = errorMsg; }
    else if (!password) { errorsObj.password = errorMsg; }
    
    return res.status(BAD_REQUEST.code).send({
      errors: errorsObj,
    });
  }
  
  try {
    const [userExistsWithSameEmail, userExistsWithSameUsername] = await Promise.all([
      getUserByEmail(email),
      getUserByUsername(username),
    ]);

    if (userExistsWithSameEmail || userExistsWithSameUsername) {
      const errorMsg = ['has already been taken'];
      
      if (userExistsWithSameEmail) {
        errorsObj.email = errorMsg;
      } else if (userExistsWithSameUsername) {
        errorsObj.username = errorMsg;
      }
      
      return res.status(UNPROCESSABLE_ENTITY.code).send({
        errors: errorsObj,
      });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await createUser({ 
      email,
      username,
      hashedPassword,
    });

    const authToken = signJwt({
      userId: newUser.id,
      email: newUser.email,
    });

    return res.status(CREATED.code).send(handleUserResponse(newUser, authToken));
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR.code).send({
      error: 'Cannot register user',
      details: error,
    });
  }
}

async function logInUserController(
  req: Request<
    void, 
    UserResponse, 
    { user: Omit<UserCredentials, 'username'>, }
  >, 
  res: Response<UserResponse>
) {
  const { user: { email, password } } = req.body;
  const errorsObj: ErrorsObj = {};

  if (!email || !password) {
    const errorMsg = ['can\'t be blank'];

    if (!email) { errorsObj.email = errorMsg; }
    else if (!password) { errorsObj.password = errorMsg; }
    
    return res.status(BAD_REQUEST.code).send({
      errors: errorsObj,
    });
  }

  try {
    const invalidCredentialsError = {
      errors: {
        'email or password': ['is invalid']
      }
    };
    
    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(FORBIDDEN.code).send(invalidCredentialsError);
    }

    const passwordIsCorrent = await comparePassword(password, user.hashedPassword);

    if (!passwordIsCorrent) {
      return res.status(FORBIDDEN.code).send(invalidCredentialsError);
    }

    const authToken = signJwt({ email, userId: user.id, });

    return res.status(CREATED.code).send(handleUserResponse(user, authToken));
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR.code).send({
      error: 'Cannot login',
      details: error,
    });
  }
}

export { registerUserController, logInUserController }
