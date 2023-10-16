'use client';

import {
  type MouseEventHandler,
  type KeyboardEventHandler,
  useEffect,
  useState,
} from 'react';

import { getJsonFetch } from '@/app/lib/api/customFetch';
import { useAppStore } from '@/app/lib/store/useAppStore';

import { TAGS_PATH } from '@/app/api/constants';

import styles from './styles.module.scss';

const pointerStyle = styles['tag--cursor'];

export default function Tags() {
  const tags = useAppStore(state => state.tags);
  const setTags = useAppStore(state => state.setTags);

  const setSelectedTab = useAppStore(state => state.setSelectedTab);
  const setPageNumber = useAppStore(store => store.setPageNum);
  const setNumArticles = useAppStore(store => store.setNumArticles);

  const [isLoadingTags, setIsLoadingTags] = useState(false);

  const onClickTag: (tag: string) => MouseEventHandler<HTMLAnchorElement> = (tag: string) => (event) => {
    event.preventDefault();

    setSelectedTab(tag);
    setPageNumber(0);
    setNumArticles(0);
  };
  const onEnterTag: (tag: string) => KeyboardEventHandler<HTMLAnchorElement> = (tag: string) => (event) => {
    if (event.code === 'Enter') {
      setSelectedTab(tag);
      setPageNumber(0);
      setNumArticles(0);
    }
  };

  useEffect(() => {
    async function getTags() {
      setIsLoadingTags(true);

      const getTagsResponse: GetTagsResponse = await getJsonFetch(TAGS_PATH, {
        loggedIn: false,
        isClientFetch: true,
      });

      if ('tags' in getTagsResponse) {
        const { tags } = getTagsResponse;
        setTags(tags);
      } else {
        setTags([]);
      }

      setIsLoadingTags(false);
    }

    getTags();

    return () => {
      setTags([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="sidebar">
      <p>Popular Tags</p>

      <div className="tag-list">
        {
          tags.map((tag) => (
            <a
              tabIndex={0}
              key={tag}
              onClick={onClickTag(tag)}
              onKeyDown={onEnterTag(tag)}
              className={`tag-pill tag-default ${pointerStyle}`}
            >
              {tag}
            </a>
          ))
        }
        {
          isLoadingTags ?
          <p>Loading Tags...</p> :
          null
        }
      </div>
    </div>
  )
}
