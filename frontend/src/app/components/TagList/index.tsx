import { clsx } from 'clsx';

import './styles.scss';

type TagListProps = {
  tagList: Tag[];
  tagClassName?: string;
  tagListClassName?: string;
};

const TagList: React.FC<TagListProps> = ({ tagList, tagClassName, tagListClassName }) => {
  if (tagList.length < 1) return null;
  
  const tagListClass = clsx('tag-list', tagListClassName);
  const tagClass = clsx('tag-default tag-pill tag-outline', tagClassName);

  return (
    <ul className={tagListClass}>
      {tagList.map((tag) => (
        <li key={tag} className={tagClass}>
          {tag}
        </li>
      ))}
    </ul>
  );
};

export default TagList;
