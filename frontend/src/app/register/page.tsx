import { type Metadata } from 'next';
import Link from 'next/link';

import SignUpFormContainer from './components/SignUpFormContainer';

import { REGISTER_TITLE } from '../constants/title';

export const metadata: Metadata = {
  title: REGISTER_TITLE,
}

export default function SignUpPage() {
  return (
    <div className="auth-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">Sign up</h1>
            <p className="text-xs-center">
              <Link href="/login">Have an account?</Link>
            </p>
            <SignUpFormContainer />
          </div>
        </div>
      </div>
    </div>
  )
}
