'use client';

import { useFormState, useFormStatus } from 'react-dom';

import Input from "@/app/components/Input";
import { DUMMY_USER_OBJECT } from '@/app/constants/user';

interface SignUpUserMessage {
  errors?: Record<string, string[]>;
}

const initialMessage: SignUpUserMessage = {
  errors: undefined,
}

interface SignUpFormProps {
  createNewUser: (prevState: SignUpUserMessage, formData: FormData) => Promise<SignUpUserMessage>,
}

export default function SignUpForm({
  createNewUser,
}: SignUpFormProps) {
  const [signUpNewUserState, formAction] = useFormState<typeof initialMessage, FormData>(createNewUser, initialMessage);

  const { errors } = signUpNewUserState;

  return (
    <>
      {
        errors
        ? (
          <ul className="error-messages">
            {
              Object.entries(errors).map(([fieldName, errorArray]) => {
                const fieldKeys = Object.keys(DUMMY_USER_OBJECT);

                return (errorArray as any[]).map((error) => {
                  const itemValue = `${fieldName} ${error}`;
                  const isFieldNameUserKey = fieldKeys.includes(fieldName);

                  return (
                    <li key={itemValue}>{`${isFieldNameUserKey ? 'That ' : ''}${fieldName} ${error}`}</li>
                  );
                });
              })
            }
          </ul>
        )
        : null
      }
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
