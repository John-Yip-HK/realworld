import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

import { comparePassword, hashPassword } from '../utils/passwordUtils';

import statusCodes from '../constants/status-codes';
import { DEFAULT_IMAGE_URL } from '../constants/users';
import { signJwt } from '../utils/jwtUtils';

import type { UserCredentials, UserResponse } from '../routes/User';
import type { ErrorsObj } from '../globals';
import { handleUserResponse } from '../utils/handleUserResponseUtils';


const prisma = new PrismaClient();

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
    
    return res.status(statusCodes.BAD_REQUEST.code).send({
      errors: errorsObj,
    });
  }
  
  try {
    const [userExistsWithSameEmail, userExistsWithSameUsername] = await Promise.all([
      prisma.users.findUnique({
        where: {
          email,
        }
      }),
      prisma.users.findUnique({
        where: {
          username,
        }
      }),
    ]);

    if (userExistsWithSameEmail || userExistsWithSameUsername) {
      const errorMsg = ['has already been taken'];
      
      if (userExistsWithSameEmail) {
        errorsObj.email = errorMsg;
      } else if (userExistsWithSameUsername) {
        errorsObj.username = errorMsg;
      }
      
      return res.status(statusCodes.UNPROCESSABLE_ENTITY.code).send({
        errors: errorsObj,
      });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await prisma.users.create({
      data: { 
        email,
        username,
        hashedPassword,
        image: DEFAULT_IMAGE_URL,
      },
      select: {
        email: true,
        username: true,
        image: true,
        bio: true,
      }
    });

    const authToken = signJwt({ 
      email: newUser.email,
    });

    return res.status(statusCodes.CREATED.code).send({
      user: {
        ...newUser,
        token: authToken,
      },
    });
  } catch (error) {
    return res.status(statusCodes.INTERNAL_SERVER_ERROR.code).send({
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
    
    return res.status(statusCodes.BAD_REQUEST.code).send({
      errors: errorsObj,
    });
  }

  try {
    const invalidCredentialsError = {
      errors: {
        'email or password': ['is invalid']
      }
    };
    
    const user = await prisma.users.findUnique({
        where: {
          email,
        }
      });

    if (!user) {
      return res.status(statusCodes.FORBIDDEN.code).send(invalidCredentialsError);
    }

    const passwordIsCorrent = await comparePassword(password, user.hashedPassword);

    if (!passwordIsCorrent) {
      return res.status(statusCodes.FORBIDDEN.code).send(invalidCredentialsError);
    }

    const authToken = signJwt({ email });

    return res.status(statusCodes.CREATED.code).send(handleUserResponse(user, authToken));
  } catch (error) {
    return res.status(statusCodes.INTERNAL_SERVER_ERROR.code).send({
      error: 'Cannot login',
      details: error,
    });
  }
}

export { registerUserController, logInUserController }
