'use client';

import { useState, type MouseEventHandler } from 'react';
import { clsx } from 'clsx';

import { useAuthStore } from '@/app/lib/store/useAuthStore';

import styles from './styles.module.scss';

type Props = {}

const tabs = [
  {
    linkName: 'your-feed',
    label: 'Your Feed',
    hideIfNoAuthToken: true,
  },
  {
    linkName: 'global-feed',
    label: 'Global Feed',
    hideIfNoAuthToken: false,
  },
];

export default function MainPageTabs({}: Props) {
  const hasAuthToken = useAuthStore((state) => state.authToken) !== undefined;
  const [selectedTab, setSelectedTab] = useState(tabs[hasAuthToken ? 0 : 1].linkName);

  const navLinkCls = (linkName: string) => clsx('nav-link', {
    active: selectedTab === linkName,
  });

  const onTabChange = (linkName: string): MouseEventHandler<HTMLAnchorElement> => (event) => {
    event.preventDefault();
    setSelectedTab(linkName);
  };
  
  return (
  <div className="feed-toggle">
    <ul className="nav nav-pills outline-active">
      {
        tabs
          .map(({ linkName, label, hideIfNoAuthToken }) => {
            const hideTabCls = styles['nav-item__hidden'];
            
            return (
              <li key={linkName} className={clsx('nav-item', !hasAuthToken && hideIfNoAuthToken ? hideTabCls : undefined)}>
                <a className={navLinkCls(linkName)} onClick={onTabChange(linkName)}>{label}</a>
              </li>
            );
          })
      }
    </ul>
  </div>
  )
}