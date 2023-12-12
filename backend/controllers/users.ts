import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

import { hashPassword } from '../utils/passwordUtils';

import statusCodes from '../constants/status-codes';

const prisma = new PrismaClient();

/**
 * Registers a new user.
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @returns A Promise that resolves to the response status.
 */
async function registerUserController(req: Request, res: Response) {
  const { user: { email, username, password } } = req.body;

  if (!email || !username || !password) {
    const missingFields = [];

    if (!email) { missingFields.push('email') }
    if (!username) { missingFields.push('username') }
    if (!password) { missingFields.push('password') }
    
    return res.status(statusCodes.BAD_REQUEST.code).send({
      error: 'Missing fields',
      missingFields,
    });
  }
  
  try {
    // Check if user already exists in the database
    const userExistsResult = await prisma.users.findUnique({
      where: {
        email,
      }
    });

    if (userExistsResult) {
      return res.status(statusCodes.BAD_REQUEST.code).send({
        error: 'User already exists',
        user: { email, username, password },
      });
    }

    const hashedPassword = await hashPassword(password);
    await prisma.users.create({
      data: { email, username, hashedPassword }
    });

    return res.status(statusCodes.CREATED.code).send({
      user: {
        email, username,
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(statusCodes.INTERNAL_SERVER_ERROR.code).send({
      error: 'Cannot register user',
      user: { email, username, password },
      stack: error,
    });
  }
}

export { registerUserController }
