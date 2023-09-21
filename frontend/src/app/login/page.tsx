'use client';

import {
  type Dispatch,
  type InputHTMLAttributes,
  type SetStateAction,
  type FormEventHandler,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { extractResponseInfo } from "../lib/api/handleResponse";
import { handleError } from "../lib/api/handlerError";
import { isAuthError } from "../lib/users/isAuthError";
import { JWT_TOKEN, UNKNOWN_ERROR_OBJECT } from "../constants/user";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errors, setErrors] = useState<AuthError>();

  const router = useRouter();

  const onValueChange: InputHTMLAttributes<HTMLInputElement>['onChange'] =
    (event) => {
      let setter: Dispatch<SetStateAction<string>> | undefined;

      switch(event.target.name) {
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

  const logInUser: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    setIsLoggingIn(true);
    setErrors(undefined);

    const logInCredentials: LogInCredentials = {
      email, password,
    }

    try {
      const logInResponse = await fetch('/api/users/login', {
        method: 'POST',
        body: JSON.stringify(logInCredentials),
      });

      const { responseBody, ok, statusText } = await extractResponseInfo<LogInUserResponse>(logInResponse);

      if (!ok) {
        throw new Error(statusText, {
          cause: (responseBody as AuthErrorResponse).errors,
        })
      }

      localStorage.setItem(JWT_TOKEN, (responseBody as SuccessResponse).user.token);

      router.push('/');
    } catch (error) {
      handleError(error, (error) => {
        if (isAuthError(error.cause)) {
          setErrors(error.cause as AuthError);
        } else {
          setErrors(UNKNOWN_ERROR_OBJECT);
        }
      });
    }finally {
      setIsLoggingIn(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">Sign in</h1>
            <p className="text-xs-center">
              <a href="/register">Need an account?</a>
            </p>

            {
              errors
              ? (
                <ul className="error-messages">
                  {
                    Object.entries(errors).map(([fieldName, errorArray]) => {
                      return errorArray.map((error) => {
                        const itemValue = `${fieldName} ${error}`;

                        return (
                          <li key={itemValue}>{itemValue}</li>
                        );
                      });
                    })
                  }
                </ul>
              )
              : null
            }

            <form onSubmit={logInUser}>
              <fieldset disabled={isLoggingIn}>
                <fieldset className="form-group">
                  <input className="form-control form-control-lg" type="email" name="email" placeholder="Email" value={email} onChange={onValueChange} />
                </fieldset>
                <fieldset className="form-group">
                  <input className="form-control form-control-lg" type="password" name="password" placeholder="Password" value={password} onChange={onValueChange} />
                </fieldset>
                <button className="btn btn-lg btn-primary pull-xs-right" type="submit">Sign in</button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
