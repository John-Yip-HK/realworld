'use client';

import { clsx } from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Props = {
  link: NavLinkProps;
  className?: string;
}

export default function NavLink({
  link, className: anchorClassName
}: Props) {
  const pathname = usePathname();
  const isActive = pathname === link.href;
  
  const cls = clsx('nav-link', {
    active: isActive,
  }, anchorClassName);
  
  return (
    <li className="nav-item" key={link.href}>
      {/* Add "active" className when you're on that page" */}
      <Link
        href={link.href}
        className={cls}
      >
        {link.children}
      </Link>
    </li>
  )
}