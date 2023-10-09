'use client';

import {
  type MouseEventHandler,
  type ReactNode,
  useEffect,
  useState,
} from 'react';

import { getJsonFetch } from '@/app/lib/api/customFetch';
import { useAppStore } from '@/app/lib/store/useAppStore';

import styles from './styles.module.scss';

const pointerStyle = styles['tag--cursor'];

export default function Tags() {
  const [tagListContent, setTagListContent] = useState<ReactNode>('Loading Tags...');
  const setTag = useAppStore(state => state.setTag);
  const setPageNumber = useAppStore(store => store.setPageNum);

  const onClickTag: (tag: string) => MouseEventHandler<HTMLAnchorElement> = (tag: string) => (event) => {
    event.preventDefault();

    setTag(tag);
    setPageNumber(0);
  };

  useEffect(() => {
    getJsonFetch('/api/tags', {
      loggedIn: false,
    })
      .then((getTagsResponse: GetTagsResponse) => {
        if ('tags' in getTagsResponse) {
          const { tags } = getTagsResponse;
          const tagsAnchors = tags.map((tag) => (
            <a
              key={tag}
              onClick={onClickTag(tag)}
              className={`tag-pill tag-default ${pointerStyle}`}
            >
              {tag}
            </a>
          ));

          setTagListContent(tagsAnchors);
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="sidebar">
      <p>Popular Tags</p>

      <div className="tag-list">
        {tagListContent}
      </div>
    </div>
  )
}
