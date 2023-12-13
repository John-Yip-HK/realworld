import { password as bunPassword } from "bun";

async function hashPassword(password: string) {
  try {
    const hashedPassword = await bunPassword.hash(password);
    return hashedPassword;
  } catch (error) {
    // Handle error
    console.error('Error hashing password:', error);
    throw error;
  }
}

async function comparePassword(rawPassword: string, hashedPassword: string) {
  try {
    const isMatch = await bunPassword.verify(rawPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    // Handle error
    console.error('Error comparing passwords:', error);
    throw error;
  }
}

export { hashPassword, comparePassword }
