'use client';

import { usePathname } from 'next/navigation';

import { hasJwtToken } from '@/app/lib/users/jwtToken';

import type { NavLinkProps } from './types';
import NavLink from './components/NavLink';
import UserNavLink from './components/UserNavLink';

const links: NavLinkProps[] = [
  {
    href: '/',
    children: 'Home',
    protectedLink: false,
  },
  {
    href: '/login',
    children: 'Sign in',
    protectedLink: false,
  },
  {
    href: '/register',
    children: 'Sign up',
    protectedLink: false,
  },
  {
    href: '/editor',
    children: (
      <>
        <i className="ion-compose"></i>&nbsp;New Article
      </>
    ),
    protectedLink: true,
  },
  {
    href: '/settings',
    children: (
      <>
        <i className="ion-gear-a"></i>&nbsp;Settings
      </>
    ),
    protectedLink: true,
  },
]

export default function Navbar() {
  const isAuthenticated = hasJwtToken();
  const pathname = usePathname();

  return (
    <nav className="navbar navbar-light">
      <div className="container">
        <a className="navbar-brand" href="/">conduit</a>
        <ul className="nav navbar-nav pull-xs-right">
          {
            links.map((link) => {
              const showLink = link.href === '/' || isAuthenticated === link.protectedLink;

              return showLink ?
                <NavLink
                  key={link.href}
                  link={link}
                  isActive={pathname === link.href}
                /> :
                null;
              }
            )
          }
          {
            isAuthenticated ?
            <UserNavLink /> :
            null
          }
        </ul>
      </div>
    </nav>
  );
}
