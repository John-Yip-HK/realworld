import { type KeyboardEventHandler, useState, Fragment, useEffect } from 'react'

import { isEnterKeyPressed } from '@/app/lib/utils';

import './styles.scss';

interface TagListProps {
  defaultValue: string[];
}

export default function TagList({
  defaultValue
}: TagListProps) {
  const hasDefaultValue = defaultValue.length > 0;
  const [enteredTags, setEnteredTags] = useState<string[]>([]);
  
  const handleEnterPress: KeyboardEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.currentTarget;

    if (
      isEnterKeyPressed(event) && 
      Boolean(value)
    ) {
      event.preventDefault();

      if (!enteredTags.includes(value)) {
        setEnteredTags((prevEnteredTags) => prevEnteredTags.concat(value.trim()));
      }

      event.currentTarget.value = '';
    }
  };

  const onClickTagPill = (tagName: string) => () => {
    setEnteredTags((prevEnteredTags) => prevEnteredTags.filter(tag => tag !== tagName));
  };

  useEffect(() => {
    if (hasDefaultValue) {
      setEnteredTags(defaultValue);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  
  return (
    <fieldset className="form-group">
      <input 
        type="text" 
        className="form-control" 
        placeholder="Enter tags" 
        onKeyDown={handleEnterPress} 
      />
      {
        enteredTags.length > 0 ?
          (
            <div className="tag-list">
              {
                enteredTags.map(tag => {
                  return (
                    <Fragment key={tag}>
                      <input type="hidden" name="tagList" value={tag} />
                      <span 
                        onClick={onClickTagPill(tag)}
                        className="tag-default tag-pill"
                      >
                        ⤫&nbsp;{tag}
                      </span>
                    </Fragment>
                  )
                })
              }
              </div>
          ) :
          null
      }
    </fieldset>
  )
}