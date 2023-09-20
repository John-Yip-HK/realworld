'use client'

import {
  type InputHTMLAttributes,
  useState,
  type Dispatch,
  type SetStateAction,
  type FormEventHandler,
} from 'react';
import { useRouter } from 'next/navigation';

import { extractResponseInfo } from '../lib/handleResponse';
import { handleError } from '../lib/handlerError';
import { isSignUpUserError } from '../lib/users/isSignUpUserError';

export default function SignUpPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [formIsDisabled, setFormIsDisabled] = useState(false);
  const [errors, setErrors] = useState<SignUpUserError>();

  const router = useRouter();

  const onValueChange: InputHTMLAttributes<HTMLInputElement>['onChange'] =
    (event) => {
      let setter: Dispatch<SetStateAction<string>> | undefined;

      switch(event.target.name) {
        case 'username':
          setter = setUsername;
          break;
        case 'email':
          setter = setEmail;
          break;
        case 'password':
          setter = setPassword;
          break;
        default:
          break;
      }

      if (setter) {
          setter(event.target.value);
      }
    };

  const signUpNewUser: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    setFormIsDisabled(true);
    setErrors(undefined);

    const user: User = {
      username,
      email,
      password,
    };

    try {
      const signUpNewUserResponse = await fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(user),
      });

      const { responseBody, ok, statusText } = await extractResponseInfo<SignUpUserResponse>(signUpNewUserResponse);

      if (!ok) {
        throw new Error(statusText, {
          cause: (responseBody as SignUpUserErrorResponse).errors,
        });
      }

      const { user: signedUpUser } = responseBody as SignUpUserSuccessResponse;

      localStorage.setItem("jwtToken", signedUpUser.token);

      router.push('/');
    } catch (error) {
      handleError(error, (error) => {
        if (isSignUpUserError(error.cause)) {
          setErrors(error.cause as SignUpUserError);
        } else {
          console.error(error);
        }
      });
    } finally {
      setFormIsDisabled(false);
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

            {
              errors
              ? (
                <ul className="error-messages">
                  {
                    Object.entries(errors).map(([fieldName, errorArray]) => {
                      return errorArray.map((error) => {
                        const itemKey = `${fieldName} ${error}`;

                        return (
                          <li key={itemKey}>{`That ${fieldName} ${error}`}</li>
                        );
                      });
                    })
                  }
                </ul>
              )
              : null
            }

            <form onSubmit={signUpNewUser}>
              <fieldset disabled={formIsDisabled}>
                <fieldset className="form-group">
                  <input className="form-control form-control-lg" type="text" placeholder="Username" name="username" value={username} onChange={onValueChange} />
                </fieldset>
                <fieldset className="form-group">
                  <input className="form-control form-control-lg" type="email" placeholder="Email" name="email" value={email} onChange={onValueChange} />
                </fieldset>
                <fieldset className="form-group">
                  <input className="form-control form-control-lg" type="password" placeholder="Password" name="password" value={password} onChange={onValueChange} />
                </fieldset>
                <button className="btn btn-lg btn-primary pull-xs-right" type="submit">Sign up</button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
