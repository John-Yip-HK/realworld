import { cookies } from 'next/headers';
import Image from 'next/image';

import { fetchFromServer } from '@/app/lib/api/customFetch';
import { getProfileNavPath } from '@/app/lib/profile/utils';

import NavLink from './NavLink';

import { TOKEN_COOKIE_NAME, USER_PATH } from '@/app/constants/user';

import './styles.scss';

export default async function UserNavLink() {
  const authToken = cookies().get(TOKEN_COOKIE_NAME);
  const userResponse = await fetchFromServer(USER_PATH, {
    headers: {
      'Authorization': `Bearer ${authToken?.value}`,
    }
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