'use client';

import { useFormState, useFormStatus } from 'react-dom';

import Input from "@/app/components/Input";
import { DUMMY_USER_OBJECT } from '@/app/constants/user';

import { signUpNewUserServerAction } from '@/app/lib/server-actions/auth';

interface SignUpUserMessage {
  errors?: Record<string, string[]>;
}

const initialMessage: SignUpUserMessage = {};

export default function SignUpFormContainer() {
  const [signUpNewUserState, formAction] = useFormState<typeof initialMessage, FormData>(signUpNewUserServerAction, initialMessage);

  const errors = signUpNewUserState?.errors;

  return (
    <>
      <Errors errors={errors} />
      <form action={formAction}>
        <FormFields />
      </form>
    </>
  )
}

function FormFields() {
  const { pending: creatingNewUser } = useFormStatus();

  return (
    <fieldset disabled={creatingNewUser}>
      <Input
        placeholder="Username"
        id="username"
        required
      />
      <Input
        placeholder="Email"
        type="email"
        id="email"
        required
      />
      <Input
        placeholder="Password"
        type="password"
        id="password"
        required
      />
      <button
        className="btn btn-lg btn-primary pull-xs-right"
        type="submit"
      >
        Sign up
      </button>
    </fieldset>
  )
}

function Errors({ errors }: SignUpUserMessage) {
  if (!errors) return null;
  const fieldKeys = Object.keys(DUMMY_USER_OBJECT);

  return (
    <ul className="error-messages">
      {
        Object.entries(errors).map(([fieldName, errorArray]) => {
          return (errorArray as any[]).map((error) => {
            const itemValue = `${fieldName} ${error}`;
            const isFieldNameUserKey = fieldKeys.includes(fieldName);
            const errorMessage = `${isFieldNameUserKey ? 'That ' : ''}${fieldName} ${error}`;

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
