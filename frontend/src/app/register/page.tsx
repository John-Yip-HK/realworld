import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

import { getApiPath } from '../api/utils';

import { getJsonFetch } from '../lib/api/customFetch';
import { TOKEN_COOKIE_NAME, USERS_PATH } from '../api/constants';

import SignUpForm from './components/SignUpForm';

export default function SignUpPage() {
  async function signUpNewUser(_: any, formData: FormData) {
    'use server';

    const newUser = {
      username: formData.get('username')!,
      email: formData.get('email')!,
      password: formData.get('password')!,
    } as User;

    const signUpUserResponse: SignUpUserResponse = await getJsonFetch(getApiPath(USERS_PATH), {
      method: 'POST',
      body: {
        user: newUser,
      },

      // TODO: This flag will be removed.
      loggedIn: false,
    });

    if ('errors' in signUpUserResponse) {
      const { errors } = signUpUserResponse;

      return {
        errors,
      }
    } else {
      cookies().set(TOKEN_COOKIE_NAME, signUpUserResponse.user.token, {
        sameSite: 'strict',
        secure: true,
        httpOnly: true,
      });

      revalidatePath('/');
      redirect('/');
    }
  }

  return (
    <div className="auth-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">Sign up</h1>
            <p className="text-xs-center">
              <a href="/login">Have an account?</a>
            </p>
            <SignUpForm createNewUser={signUpNewUser} />
          </div>
        </div>
      </div>
    </div>
  )
}
