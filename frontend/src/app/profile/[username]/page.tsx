import { fetchFromServer } from '@/app/lib/api/fetchFromServer';
import { getProfileApiPath } from '@/app/lib/profile/utils';
import { hasAuthCookie } from '@/app/lib/authCookieUtils';

import UserInfo from './components/UserInfo';
import ProfileArticles from './components/ProfileArticles';

import { USER_PATH } from '@/app/constants/user';

interface ProfilePageProps {
  params: {
    username: string;
  }
};

export default async function ProfilePage({ params: { username } }: ProfilePageProps) {
  const isLoggedIn = hasAuthCookie();

  const getUserPromise = isLoggedIn ? 
    fetchFromServer(USER_PATH, {
      isLoggedIn,
    }) as Promise<LogInUserResponse | string> :
    Promise.resolve(null);
  const getProfilePromise = fetchFromServer(getProfileApiPath(username), {
      isLoggedIn,
    }) as Promise<GetProfileResponse>;
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
  const { profile } = profileResponse

  return (
    <div className="profile-page">
      <UserInfo 
        profile={profile} 
        isProfileOfUser={userIsViewingOwnProfile} 
      />
      <ProfileArticles isLoggedIn={isLoggedIn} username={profile.username} />
    </div>
  )
}
