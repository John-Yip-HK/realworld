'use client';

import { useFormState } from 'react-dom';

import { updateCurrentUser } from '@/app/lib/server-actions/settings';

import SettingsForm from './SettingsForm';

type UpdateUserMessage = Partial<UnexpectedError>;

const initialMessage: UpdateUserMessage = {};

type SettingsFormContainerProps = {
  user: User;
}

export default function SettingsFormContainer({
  user: { token, ...userFormDefaultValues },
}: SettingsFormContainerProps) {
  const [updateUserState, formAction] = useFormState<UpdateUserMessage, FormData>(updateCurrentUser, initialMessage);
  
  return (
    <>
      <Errors errors={updateUserState.errors} />
      <form action={formAction}>
        <SettingsForm defaultValues={userFormDefaultValues}/>
      </form>
    </>
  )
}

function Errors({ errors }: UpdateUserMessage) {
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
