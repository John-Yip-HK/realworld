import { cookies } from 'next/headers';

import { fetchFromServer } from '@/app/lib/api/customFetch';
import { getProfileApiPath } from '@/app/lib/profile/utils';

import { TOKEN_COOKIE_NAME, USER_PATH } from '@/app/constants/user';
import UserInfo from './components/UserInfo';
import ProfileArticles from './components/ProfileArticles';

interface ProfilePageProps {
  params: {
    username: string;
  }
};

export default async function ProfilePage({ params: { username } }: ProfilePageProps) {
  const authToken = cookies().get(TOKEN_COOKIE_NAME);
  const isLoggedIn = authToken?.value !== undefined && authToken.value !== '';

  const getUserPromise = isLoggedIn ? 
    fetchFromServer(USER_PATH, {
      headers: {
        'Authorization': `Bearer ${authToken.value}`,
      }
    }) as Promise<LogInUserResponse | string> :
    Promise.resolve(null);
  const getProfilePromise = fetchFromServer(getProfileApiPath(username)) as Promise<GetProfileResponse>;
  const [userResponse, profileResponse] = await Promise.all([getUserPromise, getProfilePromise]);

  const serverHasError = typeof userResponse === 'string' || typeof profileResponse === 'string';
  if (serverHasError) {
    throw new Error('Server error.');
  }
  
  const getUserHasError = userResponse !== null && !('user' in userResponse);
  const getProfileHasError = !('profile' in profileResponse);
  if (getUserHasError || getProfileHasError) {
    throw new Error('Data fetching error.');
  }

  const userIsViewingOwnProfile = userResponse?.user.username === username;

  return (
    <div className="profile-page">
      <UserInfo 
        profile={profileResponse.profile} 
        isProfileOfUser={userIsViewingOwnProfile} 
      />
      <ProfileArticles isLoggedIn={isLoggedIn} username={username} />
    </div>
  )
}
