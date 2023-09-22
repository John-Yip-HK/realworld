import { clsx } from 'clsx';

type Props = {
  link: NavLinkProps;
  isActive: boolean;
}

export default function NavLink({
  link, isActive
}: Props) {
  return (
    <li className="nav-item" key={link.href}>
      {/* Add "active" className when you're on that page" */}
      <a href={link.href} className={clsx('nav-link', {
        active: isActive,
      })}>
        {link.label}
      </a>
    </li>
  )
}