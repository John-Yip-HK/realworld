'use client';

import { type KeyboardEventHandler } from 'react';
import { useFormState } from 'react-dom';

import { createArticleServerAction } from '@/app/lib/server-actions/editor';

import { isEnterKeyPressed } from '../../lib/utils';

import FormFields from './FormFields';

type EditorFormMessage = Partial<UnexpectedError>;

const initialMessage: EditorFormMessage = {};

type EditorFormContainer = {
  username: string;
}

export default function EditorFormContainer({
  username,
}: EditorFormContainer) {
  const [createPostState, formAction] = useFormState<EditorFormMessage, FormData>(createArticleServerAction, initialMessage);

  const errors = createPostState?.errors;
  
  const preventSubmitFormByEnter: KeyboardEventHandler<HTMLFormElement> = (event) => {
    if (isEnterKeyPressed(event)) event.preventDefault();
  }
  
  return (
    <>
      <Errors errors={errors} />
      <form action={formAction} onKeyDown={preventSubmitFormByEnter}>
        <input type="hidden" value={username} name="username" />
        <FormFields />
      </form>
    </>
  )
}

function Errors({ errors }: EditorFormMessage) {
  if (!errors) return null;

  return (
    <ul className="error-messages">
      {
        Object.entries(errors).map(([fieldName, errorArray]) => {
          return (errorArray as any[]).map((error) => {
            const itemValue = `${fieldName} ${error}`;
            const errorMessage = itemValue;

            return (
              <li key={itemValue}>
                {errorMessage}
              </li>
            );
          });
        })
      }
    </ul>
  );
}
