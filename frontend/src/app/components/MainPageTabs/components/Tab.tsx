import { useRef, type KeyboardEventHandler, type MouseEventHandler } from 'react';
import { clsx } from 'clsx';

import styles from './styles.module.scss';

type TabProps = {
  linkName: string;
  label: string;
  hideIfNoAuthToken: boolean;
  hasAuthToken: boolean;
  isActive: boolean;
  onTabClick: (linkName: string) => MouseEventHandler<HTMLAnchorElement>;
}

const tabLinkCls = styles['nav-link'];
const hideTabCls = styles['nav-item--hidden'];

export default function Tab({
  linkName,
  label,
  hideIfNoAuthToken,
  hasAuthToken,
  isActive,
  onTabClick,
}: TabProps) {
  const navLinkCls = clsx(
    'nav-link',
    tabLinkCls, 
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
      className={clsx('nav-item', !hasAuthToken && hideIfNoAuthToken ? hideTabCls : undefined)}
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