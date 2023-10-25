'use client';

import Pagination from '@/app/components/Pagination';
import { useAppStore } from '@/app/lib/store/useAppStore';

import { ARTICLES_PER_PAGE } from '@/app/constants/article';

export default function MainPagePagination() {
  const numArticles = useAppStore(store => store.numArticles);
  const currentPageNumber = useAppStore(store => store.pageNum);
  const setPageNumber = useAppStore(store => store.setPageNum);

  const onChangePageNum = (pageNum: number) => {
    setPageNumber(pageNum);
  };
  
  return (
    <Pagination
      numItems={numArticles}
      itemsPerPage={ARTICLES_PER_PAGE}
      currentPage={currentPageNumber}
      onPageLinkClick={onChangePageNum}
    />
  );
}
