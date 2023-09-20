'use client';

import {
  type Dispatch,
  type InputHTMLAttributes,
  type SetStateAction,
  type FormEventHandler,
  useState,
} from "react";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoggingIn, setIsLoggingIn] = useState(false);

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

    try {
      const signInResponse = await fetch('/api/users/signin', {
        method: 'POST',
        body: JSON.stringify({
          user: {
            email,
            password,
          }
        }),
      });
    } finally {
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

            {/* <ul className="error-messages">
              <li>That email is already taken</li>
            </ul> */}

            <form onSubmit={logInUser}>
              <fieldset disabled={isLoggingIn}>
                <fieldset className="form-group">
                  <input className="form-control form-control-lg" type="email" placeholder="Email" value={email} onChange={onValueChange} />
                </fieldset>
                <fieldset className="form-group">
                  <input className="form-control form-control-lg" type="password" placeholder="Password" value={password} onChange={onValueChange} />
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
