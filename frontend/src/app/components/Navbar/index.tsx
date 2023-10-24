import Link from 'next/link';

import { hasAuthCookie } from '@/app/lib/hasAuthCookie';

import NavLinks from './components/NavLinks';
import UserNavLink from './components/UserNavLink';

export default function Navbar() {
  const hasAuthToken = hasAuthCookie();

  return (
    <nav className="navbar navbar-light">
      <div className="container">
        <Link className="navbar-brand" href="/">conduit</Link>
        <ul className="nav navbar-nav pull-xs-right">
          <NavLinks hasAuthToken={hasAuthToken} />
          <UserNavLink />
        </ul>
      </div>
    </nav>
  );
}
