import {
  useRef,
  type MouseEventHandler,
  type KeyboardEventHandler
} from 'react';

import { isEnterKeyPressed } from '@/app/lib/utils';

import './styles.scss';

type TagProps = {
  tag: Tag;
  onSelected: (tag: Tag) => MouseEventHandler<HTMLAnchorElement>;
}

export default function Tag({
  tag,
  onSelected,
}: TagProps) {
  const tagRef = useRef<HTMLAnchorElement>(null);

  const onFocusKeyDown: KeyboardEventHandler<HTMLAnchorElement> = (event) => {
    if (isEnterKeyPressed(event)) {
      tagRef.current?.click();
    }
  }

  return (
    <a
      ref={tagRef}
      tabIndex={0}
      key={tag}
      onClick={onSelected(tag)}
      onKeyDown={onFocusKeyDown}
      className="tag-pill tag-default"
    >
      {tag}
    </a>
  )
}