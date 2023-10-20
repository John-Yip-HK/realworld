'use client';

import {
  type MouseEventHandler,
} from 'react';

import { useAppStore } from '@/app/lib/store/useAppStore';

import Tag from './components/Tag';
import { useTags } from '@/app/lib/hooks/swr/useTags';

export default function Tags() {
  const { tags, error, isValidating: loadingTags } = useTags();

  const setSelectedTab = useAppStore(state => state.setSelectedTab);
  const setPageNumber = useAppStore(store => store.setPageNum);
  const setNumArticles = useAppStore(store => store.setNumArticles);

  const onClickTag: (tag: string) => MouseEventHandler<HTMLAnchorElement> = (tag: string) => (event) => {
    event.preventDefault();

    setSelectedTab(tag);
    setPageNumber(0);
    setNumArticles(0);
  };

  return (
    <div className="sidebar">
      <p>Popular Tags</p>

      <div className="tag-list">
        {
          tags?.map((tag) => (
            <Tag
              key={tag}
              tag={tag}
              onSelected={onClickTag}
            />
          ))
        }
        {
          loadingTags ?
            <p>Loading Tags...</p> :
            (
              error ?
                <p>Cannot retrieve tags</p> :
                null
            )
        }
      </div>
    </div>
  )
}
