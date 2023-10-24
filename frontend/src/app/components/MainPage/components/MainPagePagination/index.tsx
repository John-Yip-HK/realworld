'use client';

import { clsx } from 'clsx';
import { useRef, type KeyboardEventHandler, type MouseEventHandler, type ReactElement } from 'react';

import { useAppStore } from '@/app/lib/store/useAppStore';

import styles from './styles.module.scss';
import { ARTICLES_PER_PAGE } from '@/app/lib/constants';

export default function MainPagePagination() {
  const numArticles = useAppStore(store => store.numArticles);
  const currentPageNumber = useAppStore(store => store.pageNum);

  const doNotShowPaginationLinks = numArticles < ARTICLES_PER_PAGE;
  const numOfLinks = doNotShowPaginationLinks ? 0 : Math.ceil(numArticles / ARTICLES_PER_PAGE);

  const paginationStyles = clsx(
    'pagination',
    doNotShowPaginationLinks ? styles['pagination--hidden'] : undefined,
  );

  let pageItems: ReactElement[] = new Array(numOfLinks)
    .fill(null)
    .map((_, index) =>
      (
        <PageLink
          key={index}
          pageNumber={index}
          isActive={index === currentPageNumber}
        />
      )
    );

  return (
    <ul className={paginationStyles}>
      {pageItems}
    </ul>
  )
}

interface PageLinkProps {
  isActive: boolean;
  pageNumber: number;
}

function PageLink({
  isActive,
  pageNumber,
}: PageLinkProps) {
  const pageItemCls = clsx('page-item', styles['page-item'], isActive ? 'active' : undefined);
  const pageLinkCls = clsx('page-link', styles['page-link']);

  const setPageNumber = useAppStore(store => store.setPageNum);
  const onChangePageNum: (pageNum: number) => MouseEventHandler<HTMLAnchorElement> = (pageNum) => (event) => {
    event.preventDefault();
    setPageNumber(pageNum);
  };

  const anchorRef = useRef<HTMLAnchorElement>(null);

  const onFocusKeyDown: KeyboardEventHandler<HTMLAnchorElement> = (event) => {
    if (event.code === 'Enter') {
      anchorRef.current?.click();
    }
  };

  return (
    <li className={pageItemCls}>
      <a
        ref={anchorRef}
        tabIndex={0}
        className={pageLinkCls}
        onClick={onChangePageNum(pageNumber)}
        onKeyDown={onFocusKeyDown}
      >
        {pageNumber + 1}
      </a>
    </li>
  );
}