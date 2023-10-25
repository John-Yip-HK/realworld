import { clsx } from 'clsx';

import PageLink, { type PageLinkProps } from './components/PageLink';

import './styles.scss';

interface PaginationProps {
  numItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageLinkClick: PageLinkProps['onClick'];
}

export default function Pagination({
  numItems,
  itemsPerPage,
  currentPage,
  onPageLinkClick,
}: PaginationProps) {
  const doNotShowPaginationLinks = numItems < itemsPerPage;
  const numOfLinks = doNotShowPaginationLinks ? 0 : Math.ceil(numItems / itemsPerPage);

  const paginationStyles = clsx(
    'pagination',
    doNotShowPaginationLinks ? 'pagination--hidden' : undefined,
  );

  const pageItems = new Array(numOfLinks)
    .fill(null)
    .map((_, index) =>
      (
        <PageLink
          key={`page-${index}`}
          pageNumber={index}
          isActive={index === currentPage}
          onClick={onPageLinkClick}
        />
      )
    );
  
  return (
    <ul className={paginationStyles}>
      {pageItems}
    </ul>
  )
}