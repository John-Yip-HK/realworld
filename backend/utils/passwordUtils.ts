import { password as bunPassword } from 'bun';

async function hashPassword(password: string) {
  return await bunPassword.hash(password);
}

async function comparePassword(rawPassword: string, hashedPassword: string) {
  return await bunPassword.verify(rawPassword, hashedPassword);
}

export { hashPassword, comparePassword }
