'use client';

import { usePathname } from 'next/navigation';
import { hasJwtToken } from '@/app/lib/users/jwtToken';

const links: NavLinkProps[] = [
  {
    href: '/',
    label: 'Home',
  },
  {
    href: '/login',
    label: 'Sign in',
  },
  {
    href: '/register',
    label: 'Sign up',
  },
]

export default function Navbar() {
  const isAuthenticated = hasJwtToken();
  const pathname = usePathname();

  const unauthenticatedUserNavbar = (
    <nav className="navbar navbar-light">
      <div className="container">
        <a className="navbar-brand" href="/">conduit</a>
        <ul className="nav navbar-nav pull-xs-right">
          {
            links.map((link) => (
              <li className="nav-item" key={link.href}>
                {/* Add "active" className when you're on that page" */}
                <a href={link.href} className={clsx('nav-link', {
                  active: pathname === link.href,
                })}>
                  {link.label}
                </a>
              </li>
            ))
          }
        </ul>
      </div>
    </nav>
  );

  const authenticatedUserNavbar = (
    <nav className="navbar navbar-light">
      <div className="container">
        <a className="navbar-brand" href="/">conduit</a>
        <ul className="nav navbar-nav pull-xs-right">
          <li className="nav-item">
            {/* Add "active" className when you're on that page" */}
            <a className="nav-link active" href="/">Home</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/editor"> <i className="ion-compose"></i>&nbsp;New Article </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/settings"> <i className="ion-gear-a"></i>&nbsp;Settings </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/profile/eric-simons">
              <img src="" className="user-pic" />
              Eric Simons
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );

  return isAuthenticated ? authenticatedUserNavbar : unauthenticatedUserNavbar;
}
