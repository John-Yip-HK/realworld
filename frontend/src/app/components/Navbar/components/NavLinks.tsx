import { FaRegEdit } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";

import NavLink from './NavLink';

import './styles.scss';

interface NavLinksProps {
  hasAuthToken: boolean;
}

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
      <nav className="nav-link--with-icon">
        <FaRegEdit />
        &nbsp;
        New Article
      </nav>
    ),
    protectedLink: true,
  },
  {
    href: '/settings',
    children: (
      <nav className="nav-link--with-icon">
        <IoSettingsOutline />
        &nbsp;
        <span>Settings</span>
      </nav>
    ),
    protectedLink: true,
  },
];

export default function NavLinks({
  hasAuthToken,
}: NavLinksProps) {
  return links.map((link) => {
    const { href } = link;
    const shouldShow = href === '/' || (hasAuthToken ? link.protectedLink : !link.protectedLink);
    const extraStylingCls = shouldShow ? undefined : 'nav-link--hidden';

    return (
      <NavLink
        key={href}
        link={link}
        className={extraStylingCls}
      />
    );
  });
}
