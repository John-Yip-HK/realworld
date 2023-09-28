import { clsx } from 'clsx';

import type { NavLinkProps } from '../types';

type Props = {
  link: NavLinkProps;
  isActive: boolean;
  className?: string;
}

export default function NavLink({
  link, isActive, className: anchorClassName
}: Props) {
  return (
    <li className="nav-item" key={link.href}>
      {/* Add "active" className when you're on that page" */}
      <a
        href={link.href}
        className={clsx('nav-link', {
          active: isActive,
        }, anchorClassName)}
      >
        {link.children}
      </a>
    </li>
  )
}