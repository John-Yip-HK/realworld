'use client';

import {
  type MouseEventHandler,
  useEffect
} from 'react';

import { useAppStore } from '@/app/lib/store/useAppStore';

import Tab from './components/Tab';
import { GLOBAL_FEED_LINK_NAME, YOUR_FEED_LINK_NAME } from './constants';

interface MainPageTabsProps {
  isLoggedIn: boolean;
}

export default function MainPageTabs({
  isLoggedIn,
}: MainPageTabsProps) {
  const setPageNumber = useAppStore(store => store.setPageNum);
  const setNumArticles = useAppStore(store => store.setNumArticles);

  // const tags = useAppStore(store => store.tags);
  const selectedTab = useAppStore(store => store.selectedTab);
  const setSelectedTab = useAppStore(store => store.setSelectedTab);

  const onTabChange = (linkName: string): MouseEventHandler<HTMLAnchorElement> => (event) => {
    event.preventDefault();

    setPageNumber(0);
    setNumArticles(0);
    setSelectedTab(linkName);
  };

  useEffect(() => {
    if (isLoggedIn) {
      setSelectedTab(YOUR_FEED_LINK_NAME);
    } else {
      setSelectedTab(GLOBAL_FEED_LINK_NAME);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const yourFeedTab = isLoggedIn ?
    <Tab
      key={YOUR_FEED_LINK_NAME}
      isActive={YOUR_FEED_LINK_NAME === selectedTab}
      label="Your Feed"
      linkName={YOUR_FEED_LINK_NAME}
      onTabClick={onTabChange}
    /> :
    null;

  const selectedTagTab = null;

  return (
  <div className="feed-toggle">
    <ul className="nav nav-pills outline-active">
      {yourFeedTab}
      <Tab
        key={GLOBAL_FEED_LINK_NAME}
        isActive={GLOBAL_FEED_LINK_NAME === selectedTab}
        label="Global Feed"
        linkName={GLOBAL_FEED_LINK_NAME}
        onTabClick={onTabChange}
      />
      {selectedTagTab}
    </ul>
  </div>
  )
}