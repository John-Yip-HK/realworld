import { Request, Response } from 'express';

import statusCodes from '../constants/status-codes';
import { type UserCredentials } from '../routes/User';

/**
 * Registers a new user.
 * 
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} A promise that resolves when the user is registered successfully.
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
    // const userExistsQuery = `
    //   SELECT * FROM users 
    //   WHERE email = $1
    // `;
    // const userExistsResult = await dbQuery(userExistsQuery, [email]);

    // if (userExistsResult.length > 0) {
    //   return res.status(400).send({
    //     error: 'User already exists',
    //     user: { email, username, password },
    //   });
    // }

    // const hashedPassword = await hashPassword(password);
    // // Insert new user into the database
    // const insertUserQuery = `
    //   INSERT INTO users (email, username, hashed_password) 
    //   VALUES ($1, $2, $3)
    // `;
    // await dbQuery(insertUserQuery, [email, username, hashedPassword]);

    return res.sendStatus(statusCodes.CREATED.code);
  } catch (error) {
    console.error(error);
    return res.status(statusCodes.INTERNAL_SERVER_ERROR.code).send({
      error: 'Cannot register user',
      user: { email, username, password },
      originalError: error,
    });
  }
}

export { registerUserController }
