'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

import { TOKEN_COOKIE_NAME, UNKNOWN_ERROR_OBJECT } from '@/app/constants/user';

import { LOGIN_PATH, USERS_PATH } from '../../constants/user';
import { fetchFromServer } from '../../lib/api/fetchFromServer';

function setAuthCookie(token: string) {
  cookies().set(TOKEN_COOKIE_NAME, token, {
    sameSite: 'strict',
    secure: true,
    httpOnly: true,
  });
}

export async function signUpNewUserServerAction(_: unknown, formData: FormData) {
  const newUser = {
    username: formData.get('username')?.toString() ?? null,
    email: formData.get('email')?.toString() ?? null,
    password: formData.get('password')?.toString() ?? null,
  } satisfies NewUserCredentials;

  if (!Object.values(newUser).every(Boolean)) {
    return {
      errors: {
        'Missing field(s):': ['All fields must be present.'],
      }
    }
  }

  try {
    const signUpUserResponse: SignUpUserResponse = await fetchFromServer(USERS_PATH, {
      method: 'POST',
      body: {
        user: newUser,
      },
      isLoggedIn: false,
    });

    if ('errors' in signUpUserResponse) {
      const { errors } = signUpUserResponse;

      return {
        errors,
      }
    } else {
      setAuthCookie(signUpUserResponse.user.token);
    }
  } catch {
    return {
      errors: UNKNOWN_ERROR_OBJECT,
    };
  }

  revalidatePath('/');
  redirect('/');
}

export async function loginServerAction(_: unknown, formData: FormData) {
  const loginCredentials = {
    email: formData.get('email')?.toString() ?? null,
    password: formData.get('password')?.toString() ?? null,
  } satisfies LogInCredentials;

  if (!Object.values(loginCredentials).every(Boolean)) {
    return {
      errors: {
        'Missing field(s):': ['All fields must be present.'],
      }
    }
  }

  try {
    const loginResponse: LogInUserResponse = await fetchFromServer(LOGIN_PATH, {
      method: 'POST',
      body: {
        user: loginCredentials,
      },
      isLoggedIn: false,
    });

    if ('errors' in loginResponse) {
      const { errors } = loginResponse;

      return {
        errors,
      }
    }
    else if ('status' in loginResponse) {
      const { message } = loginResponse;

      return {
        errors: {
          'Authorization Error': [message.charAt(0).toUpperCase() + message.slice(1)],
        },
      };
    }
    else {
      setAuthCookie(loginResponse.user.token);
    }
  } catch {
    return {
      errors: UNKNOWN_ERROR_OBJECT,
    };
  }

  revalidatePath('/');
  redirect('/');
}

export async function logOutServerAction() {
  cookies().delete(TOKEN_COOKIE_NAME);

  await new Promise((res) => {
    setTimeout(res, 1000);
  });

  revalidatePath('/');
  redirect('/');
}
