import { fetchFromServer } from '@/app/lib/api/fetchFromServer';
import { getProfileApiPath } from '@/app/lib/profile/utils';
import { hasAuthCookie } from '@/app/lib/authCookieUtils';
import { concatenateTitleDynamicBlock } from '@/app/lib/utils';

import UserInfo from './components/UserInfo';
import ProfileArticles from './components/ProfileArticles';

import { USER_PATH } from '@/app/constants/user';
import { PROFILE_TITLE } from '@/app/constants/title';

interface MetadataProps {
  params: {
    username: string;
  }
};

export async function generateMetadata({
  params: { username }
}: MetadataProps) {
  let title: string = PROFILE_TITLE;
  const isLoggedIn = hasAuthCookie();

  try {
    const getProfileResponse = await fetchFromServer<GetProfileResponse>(
      getProfileApiPath(username),
      { isLoggedIn }
    );

    if (
        !(typeof getProfileResponse === 'string') &&
        'profile' in getProfileResponse
      ) {
      title = concatenateTitleDynamicBlock(PROFILE_TITLE, getProfileResponse.profile.username);
    }
  } catch {}
  
  return {
    title,
  }
}

type ProfilePageProps = MetadataProps;

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
