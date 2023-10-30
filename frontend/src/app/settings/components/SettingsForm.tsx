import { useFormStatus } from 'react-dom';

import Input from '@/app/components/Input';
import Textarea from '@/app/components/Textarea';

type SettingsFormProps = {
  defaultValues: Omit<User, 'token'>,
};

const SettingsForm = ({
  defaultValues: {
    image,
    username,
    bio,
    email,
  },
}: SettingsFormProps) => {
  const { pending: updatingUser } = useFormStatus();
  
  return (
    <fieldset disabled={updatingUser}>
      <Input
        id="image"
        placeholder="URL of profile picture" defaultValue={image}
        size="md"
      />
      <Input
        id="username"
        placeholder="Your Name"
        defaultValue={username}
      />
      <Textarea
        id="bio"
        rows={8}
        placeholder="Short bio about you"
        defaultValue={bio ?? ''}
      />
      <Input
        id="email"
        type="email" 
        placeholder="Email" 
        defaultValue={email}
      />
      <Input
        id="password"
        type="password"
        placeholder="New Password"
      />
      <button className="btn btn-lg btn-primary pull-xs-right" type="submit">
        Update Settings
      </button>
    </fieldset>
  );
};

export default SettingsForm;
