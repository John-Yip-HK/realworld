import Image from 'next/image';

import { fetchFromServer } from '@/app/lib/api/fetchFromServer';
import { getProfileNavPath } from '@/app/lib/profile/utils';
import { hasAuthCookie } from '@/app/lib/authCookieUtils';

import NavLink from './NavLink';

import { USER_PATH } from '@/app/constants/user';

import './styles.scss';

export default async function UserNavLink() {
  const isLoggedIn = hasAuthCookie();
  const userResponse = await fetchFromServer(USER_PATH, {
    isLoggedIn,
  }) as LogInUserResponse | string;

  if (typeof userResponse !== 'string' && 'user' in userResponse) {
    const { username, image: imageUrl, } = userResponse.user;
    const userProfileHref = getProfileNavPath(username);

    return (
      <NavLink
        key={userProfileHref}
        link={{
          href: userProfileHref,
          children: (
            <>
              <Image 
                alt={username !== '' ? `Image of ${username}` : 'Empty user image'} 
                src={imageUrl} 
                className='user-pic'
                width={26}
                height={26}
              />
              {username}
            </>
          ),
          protectedLink: true,
        }}
      />
    )
  } else {
    return null;
  }
}