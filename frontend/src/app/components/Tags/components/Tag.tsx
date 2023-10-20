import {
  useRef,
  type MouseEventHandler,
  type KeyboardEventHandler
} from 'react';

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
    if (event.code === 'Enter') {
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