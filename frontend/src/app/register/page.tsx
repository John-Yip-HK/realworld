'use client'

import {
  type InputHTMLAttributes,
  useState,
  type Dispatch,
  type SetStateAction,
  type FormEventHandler,
} from 'react';

export default function SignUpPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [formIsDisabled, setFormIsDisabled] = useState(false);

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

    const user: User = {
      username,
      email,
      password,
    };

    try {
      const signUpNewUserResponse = await fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({ user }),
      });

      console.log(await signUpNewUserResponse.json());
    } catch (error) {
      console.info(error);
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

            {/* <ul className="error-messages">
              <li>That email is already taken</li>
            </ul> */}

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
