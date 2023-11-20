import { fetchFromServer } from '../lib/api/fetchFromServer';
import SettingsFormContainer from './components/SettingsFormContainer';
import LogOutButton from './components/LogOutButton';

import { USER_PATH } from '../constants/user';
import { SETTINGS_TITLE } from '../constants/title';
import { concatenateTitleDynamicBlock } from '../lib/utils';

export async function generateMetadata() {
  let title: string = SETTINGS_TITLE;

  try {
    const userInfo = await fetchFromServer<GetUserResponse>(USER_PATH);

    if ('user' in userInfo) {
      title = concatenateTitleDynamicBlock(SETTINGS_TITLE, userInfo.user.username);
    }
  } catch {}
  
  return {
    title,
  }
}

export default async function SettingsPage() {
  const userInfo = await fetchFromServer<GetUserResponse>(USER_PATH);

  if (!('user' in userInfo)) {
    throw new Error('Failed to get user information.');
  }

  return (
    <div className="settings-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">Your Settings</h1>
            <SettingsFormContainer
              user={userInfo.user}
            />
            <hr />
            <LogOutButton />
          </div>
        </div>
      </div>
    </div>
  )
}