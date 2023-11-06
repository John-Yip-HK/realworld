'use client';

import { type KeyboardEventHandler } from 'react';
import { useFormState } from 'react-dom';

import { createArticleServerAction, updateArticleServerAction } from '@/app/lib/server-actions/editor';

import { isEnterKeyPressed } from '../../lib/utils';

import FormFields from './FormFields';

type EditorFormMessage = Partial<UnexpectedError> | Partial<UnauthorizedError>;

const initialMessage: EditorFormMessage = {};

type EditorFormContainer = {
  username: string;
  formDefaultValues?: FormDefaultValues & { slug: string; };
}

export default function EditorFormContainer({
  username,
  formDefaultValues
}: EditorFormContainer) {
  const [mutatePostState, formAction] = useFormState<EditorFormMessage, FormData>(
    formDefaultValues ? updateArticleServerAction : createArticleServerAction, 
    initialMessage
  );

  const errors = (mutatePostState as Partial<UnexpectedError>)?.errors || (mutatePostState as UnauthorizedError) || undefined;
  
  const preventSubmitFormByEnter: KeyboardEventHandler<HTMLFormElement> = (event) => {
    if (isEnterKeyPressed(event)) event.preventDefault();
  }
  
  return (
    <>
      <Errors errors={errors} />
      <form action={formAction} onKeyDown={preventSubmitFormByEnter}>
        <input type="hidden" value={username} name="username" />
        {
          formDefaultValues ? 
            <input type="hidden" value={formDefaultValues.slug} name="slug" /> :
            null
        }
        <FormFields formDefaultValues={formDefaultValues} />
      </form>
    </>
  )
}

function Errors({ errors }: {
  errors?: Record<string, string[]> | UnauthorizedError; 
}) {
  if (!errors) return null;

  return (
    <ul className="error-messages">
      {
        'status' in errors ?
          <li>
            {errors.message}
          </li> :
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
