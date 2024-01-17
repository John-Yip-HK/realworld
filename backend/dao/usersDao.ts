import { type User } from '@prisma/client';

import prisma from '../prisma/client';

import { DEFAULT_IMAGE_URL } from '../constants/users';
import type { AmendableUserFields } from '../routes/User';

/**
 * Retrieves a user from the database based on their email.
 * @param email - The email of the user to retrieve.
 * @returns A promise that resolves to the user object if found, or null if not found.
 */
export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: {
      email,
    }
  });
}

/**
 * Retrieves a user from the database based on their username.
 * @param username - The username of the user to retrieve.
 * @returns A Promise that resolves to the user object if found, or null if not found.
 */
export async function getUserByUsername(username: string) {
  return await prisma.user.findUnique({
    where: {
      username,
    }
  });
}

/**
 * Creates a new user in the database.
 * @param newUser - The user object containing email, username, and hashed password.
 * @returns A promise that resolves to the created user.
 */
export async function createUser(newUser: Pick<User, 'email' | 'username' | 'hashedPassword'>) {
  return await prisma.user.create({
    data: {
      ...newUser,
      image: DEFAULT_IMAGE_URL,
    }
  });
}

/**
 * Updates a user by their email.
 * @param email - The email of the user to update.
 * @param newUserDetails - The new details to update for the user.
 * @returns A promise that resolves to the updated user.
 */
export async function updateUserByEmail(email: string, newUserDetails: Partial<AmendableUserFields>) {
  return await prisma.user.update({
    where: { email },
    data: newUserDetails,
  });
}
