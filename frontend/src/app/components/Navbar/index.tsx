'use client';

import { usePathname } from 'next/navigation';

import { hasJwtToken } from '@/app/lib/users/jwtToken';

import type { NavLinkProps } from './types';
import NavLink from './components/NavLink';
import UserNavLink from './components/UserNavLink';

import styles from './styles.module.scss';
import { useEffect, useState } from 'react';

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
    children: ' New Article',
    protectedLink: true,
  },
  {
    href: '/settings',
    children: ' Settings',
    protectedLink: true,
  },
]

export default function Navbar() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsAuthenticated(hasJwtToken());
    setIsLoaded(true);
  }, [])

  return (
    <nav className="navbar navbar-light">
      <div className="container">
        <a className="navbar-brand" href="/">conduit</a>
        <ul className="nav navbar-nav pull-xs-right">
          {
            links.map((link) => {
              const { href } = link;
              const shouldShow = href === '/' || isLoaded && (isAuthenticated ? link.protectedLink : !link.protectedLink);
              const extraStylingCls = shouldShow ? undefined : styles['nav-link__hidden'];

              return (
                <NavLink
                  key={href}
                  link={link}
                  isActive={pathname === href}
                  className={extraStylingCls}
                />
              );
            })
          }
          <UserNavLink
            isAuthenticated={isAuthenticated}
          />
        </ul>
      </div>
    </nav>
  );
}
