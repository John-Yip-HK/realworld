import { clsx } from 'clsx';

import { 
  type KeyboardEventHandler, 
  type MouseEventHandler, 
  useRef,
} from 'react';

import './styles.scss';

type ClickEvent = Parameters<MouseEventHandler<HTMLAnchorElement>>[0];

export interface PageLinkProps {
  isActive: boolean;
  /* Zero-based page number. */
  pageNumber: number;
  onClick: (pageNum: number, event: ClickEvent) => void;
}

export default function PageLink({
  isActive,
  pageNumber,
  onClick,
}: PageLinkProps) {
  const pageLinkContainerCls = clsx('page-item', isActive ? 'active' : undefined);
  const anchorRef = useRef<HTMLAnchorElement>(null);

  const onChangePageNum: MouseEventHandler<HTMLAnchorElement> = (event) => {
    event.preventDefault();
    onClick(pageNumber, event);
  };

  const onFocusKeyDown: KeyboardEventHandler<HTMLAnchorElement> = (event) => {
    if (event.code === 'Enter') {
      anchorRef.current?.click();
    }
  };

  return (
    <li className={pageLinkContainerCls}>
      <a
        ref={anchorRef}
        tabIndex={0}
        className="page-link"
        onClick={onChangePageNum}
        onKeyDown={onFocusKeyDown}
      >
        {pageNumber + 1}
      </a>
    </li>
  );
}