import { useRef, type KeyboardEventHandler, type MouseEventHandler } from 'react';
import { clsx } from 'clsx';

import './styles.scss';

type TabProps = {
  isActive: boolean;
  label: string;
  linkName: string;
  onTabClick: (linkName: string) => MouseEventHandler<HTMLAnchorElement>;
}

export default function Tab({
  linkName,
  label,
  isActive,
  onTabClick,
}: TabProps) {
  const navLinkCls = clsx(
    'nav-link',
    {
      active: isActive,
    }
  );
  const anchorRef = useRef<HTMLAnchorElement>(null);

  const onFocusKeyDown: KeyboardEventHandler<HTMLLIElement> = (event) => {
    if (event.code === 'Enter') {
      anchorRef.current?.click();
    }
  };

  return (
    <li
      tabIndex={0}
      onKeyDown={onFocusKeyDown}
      className="nav-item"
    >
      <a
        ref={anchorRef}
        className={navLinkCls}
        onClick={onTabClick(linkName)}
      >
        {label}
      </a>
    </li>
  )
}