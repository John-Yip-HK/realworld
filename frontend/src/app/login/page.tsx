import { type Metadata } from 'next';
import Link from "next/link";

import LogInFormContainer from "./components/LogInFormContainer";

import { LOGIN_TITLE } from '../constants/title';
import { SIGN_UP_PATH } from '../constants/user';

export const metadata: Metadata = {
  title: LOGIN_TITLE,
}

export default function LoginPage() {
  return (
    <div className="auth-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">Sign in</h1>
            <p className="text-xs-center">
              <Link href={SIGN_UP_PATH}>Need an account?</Link>
            </p>
            <LogInFormContainer />
          </div>
        </div>
      </div>
    </div>
  )
}
