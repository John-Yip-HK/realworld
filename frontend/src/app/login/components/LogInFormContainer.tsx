'use client';

import Input from "@/app/components/Input";
import { useFormState, useFormStatus } from "react-dom";

import { loginServerAction } from '@/app/lib/server-actions/auth';

interface LogInUserMessage {
  errors?: Record<string, string[]>;
}

const initialMessage: LogInUserMessage = {};

export default function LogInFormContainer() {
  const [logInState, formAction] = useFormState<typeof initialMessage, FormData>(loginServerAction, initialMessage);

  const errors = logInState?.errors;

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
  const { pending: loggingIn } = useFormStatus();

  return (
    <fieldset disabled={loggingIn}>
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
        Sign in
      </button>
    </fieldset>
  )
}

function Errors({ errors }: LogInUserMessage) {
  if (!errors) return null;
  const fieldKeys = ['email', 'password'];

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
