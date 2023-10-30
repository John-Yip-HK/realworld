'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { UNKNOWN_ERROR_OBJECT, USER_PATH } from '@/app/constants/user';

import { getFormDataAttributeFunc } from './utils';
import { fetchFromServer } from '../api/fetchFromServer';

export async function updateCurrentUser(_: unknown, formData: FormData) {
  const getData = getFormDataAttributeFunc(formData);
  const username = getData('username');
  
  const userInfoBody = {
    user: {
      email: getData('email'),
      password: getData('password'),
      username,
      bio: getData('bio'),
      image: getData('image'),
    },
  } satisfies UpdateUserBody;

  if (!Object.values(userInfoBody).every(Boolean)) {
    return {
      errors: {
        'Missing field(s):': ['All fields must be present.'],
      }
    }
  }

  try {
    const updateUserResponse: UpdateUserResponse = await fetchFromServer(USER_PATH, {
      method: 'PUT',
      body: userInfoBody,
    });

    if ('errors' in updateUserResponse) {
      const { errors } = updateUserResponse;

      return {
        errors,
      };
    }
    else if ('status' in updateUserResponse) {
      const { message } = updateUserResponse;

      return {
        errors: {
          'Authorization Error:': [message.charAt(0).toUpperCase() + message.slice(1)],
        },
      };
    }
  } catch {
    return {
      errors: UNKNOWN_ERROR_OBJECT,
    };
  }
  
  revalidatePath('/profile/[username]', 'page');
  redirect(`/profile/${username}`);
}
