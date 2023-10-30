import { fetchFromServer } from '../lib/api/fetchFromServer';
import SettingsFormContainer from './components/SettingsFormContainer';
import LogOutButton from './components/LogOutButton';

import { USER_PATH } from '../constants/user';

export default async function SettingsPage() {
  const userInfo = await fetchFromServer(USER_PATH) as GetUserResponse;

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