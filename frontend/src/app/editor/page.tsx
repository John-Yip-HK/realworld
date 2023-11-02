import { fetchFromServer } from '../lib/api/fetchFromServer';
import EditorFormContainer from './components/EditorFormContainer';

import { USER_PATH } from '../constants/user';

export default async function NewArticlePage() {
  const getUserResponse: GetUserResponse = await fetchFromServer(USER_PATH);

  if (!('user' in getUserResponse)) {
    throw new Error('Cannot retrieve user.');
  }

  const { username } = getUserResponse.user;
  
  return (
    <div className="editor-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-10 offset-md-1 col-xs-12">
            <EditorFormContainer username={username} />
          </div>
        </div>
      </div>
    </div>
  )
}
