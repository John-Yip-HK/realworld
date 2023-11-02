import { type KeyboardEventHandler, useState, Fragment } from 'react'

import { isEnterKeyPressed } from '@/app/lib/utils';

import './styles.scss';

export default function TagList() {
  const [enteredTags, setEnteredTags] = useState<string[]>([]);
  
  const handleEnterPress: KeyboardEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.currentTarget;

    if (
      isEnterKeyPressed(event) && 
      Boolean(value) && 
      !enteredTags.includes(value)
    ) {
      setEnteredTags((prevEnteredTags) => prevEnteredTags.concat(value));

      event.currentTarget.value = '';
    }
  };

  const onClickTagPill = (tagName: string) => () => {
    setEnteredTags((prevEnteredTags) => prevEnteredTags.filter(tag => tag !== tagName));
  };
  
  return (
    <fieldset className="form-group">
      <input type="text" className="form-control" placeholder="Enter tags" onKeyDown={handleEnterPress} />
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