'use client';

import { useState, type MouseEventHandler, type ReactElement, useEffect } from 'react';

import { useAppStore } from '@/app/lib/store/useAppStore';
import { useHasAuthToken } from '@/app/lib/hooks/useHasAuthToken';

import Tab from './components/Tab';
import { tabs } from './constants';

export default function MainPageTabs() {
  const setPageNumber = useAppStore(store => store.setPageNum);
  const setNumArticles = useAppStore(store => store.setNumArticles);

  const hasAuthToken = useHasAuthToken();

  const tags = useAppStore(store => store.tags);
  const selectedTab = useAppStore(store => store.selectedTab);
  const setSelectedTab = useAppStore(store => store.setSelectedTab);

  const [tagTab, setTagTab] = useState<ReactElement>();

  const onTabChange = (linkName: string): MouseEventHandler<HTMLAnchorElement> => (event) => {
    event.preventDefault();

    setPageNumber(0);
    setNumArticles(0);
    setSelectedTab(linkName);
  };

  useEffect(() => {
    const initialSelectedTab = tabs[hasAuthToken ? 0 : 1].linkName;
    setSelectedTab(initialSelectedTab);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAuthToken]);

  useEffect(() => {
    let newTagTab: typeof tagTab = undefined;

    if (tags.includes(selectedTab)) {
      newTagTab = (
        <Tab
          hideIfNoAuthToken={false}
          isActive
          key={selectedTab}
          linkName={selectedTab}
          label={selectedTab}
          onTabClick={onTabChange}
        />
      );

      setSelectedTab(selectedTab);
    }

    setTagTab(newTagTab);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab]);

  return (
  <div className="feed-toggle">
    <ul className="nav nav-pills outline-active">
      {
        tabs
          .map((tabProps) => {
            const { linkName } = tabProps;

            return (
              <Tab
                key={linkName}
                onTabClick={onTabChange}
                isActive={selectedTab === linkName}
                hasAuthToken={hasAuthToken}
                {...tabProps}
              />
            );
          })
      }
      {tagTab}
    </ul>
  </div>
  )
}