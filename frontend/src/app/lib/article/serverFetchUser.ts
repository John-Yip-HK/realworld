import { fetchFromServer } from '../api/fetchFromServer';

import { USER_PATH } from '@/app/constants/user';

export async function serverFetchUser() {
  const getUserResponse: GetUserResponse = await fetchFromServer(USER_PATH);

  if (!('user' in getUserResponse)) {
    throw new Error('Cannot retrieve user.');
  }

  return getUserResponse.user;
}