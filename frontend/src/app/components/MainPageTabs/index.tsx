'use client';

import { useState, type MouseEventHandler, type ReactElement, useEffect } from 'react';

import { useAppStore } from '@/app/lib/store/useAppStore';
import { useHasAuthToken } from '@/app/lib/hooks/useHasAuthToken';

import Tab from './components/Tab';

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

export default function MainPageTabs() {
  const selectedTag = useAppStore(state => state.selectedTag);
  const resetTag = useAppStore(state => state.resetTag);
  const setPageNumber = useAppStore(store => store.setPageNum);

  const hasAuthToken = useHasAuthToken();

  const initialSelectedTab = tabs[hasAuthToken ? 0 : 1];

  const [selectedTab, setSelectedTab] = useState(initialSelectedTab.linkName);
  const [tagTab, setTagTab] = useState<ReactElement>();

  const onTabChange = (linkName: string): MouseEventHandler<HTMLAnchorElement> => (event) => {
    event.preventDefault();

    if (selectedTag && linkName !== selectedTag) {
      resetTag();
    }

    setPageNumber(0);
    setSelectedTab(linkName);
  };

  useEffect(() => {
    let newTagTab: typeof tagTab = undefined;

    if (selectedTag) {
      newTagTab = (
        <Tab
          key={selectedTag}
          linkName={selectedTag}
          label={selectedTag}
          hideIfNoAuthToken={false}
          hasAuthToken={hasAuthToken}
          isActive
          onTabClick={onTabChange}
        />
      );

      setSelectedTab(selectedTag);
    }

    setTagTab(newTagTab);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTag, hasAuthToken]);

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