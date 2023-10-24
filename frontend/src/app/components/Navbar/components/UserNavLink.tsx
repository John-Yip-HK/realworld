/* eslint-disable @next/next/no-img-element */
import { fetchFromServer } from '@/app/lib/api/customFetch';

import NavLink from './NavLink';
import { USER_PATH } from '@/app/api/constants';

import './styles.scss';
import { cookies } from 'next/headers';
import { TOKEN_COOKIE_NAME } from '@/app/constants/user';

export default async function UserNavLink() {
  const authToken = cookies().get(TOKEN_COOKIE_NAME);
  const userResponse = await fetchFromServer(USER_PATH, {
    headers: {
      'Authorization': `Bearer ${authToken?.value}`,
    }
  }) as LogInUserResponse;

  console.log(userResponse);
  
  if (userResponse && 'user' in userResponse) {
    const { username, image: imageUrl, } = userResponse.user;

    return (
      <NavLink
        key='/profile'
        link={{
          href: '/profile',
          children: (
            <>
              <img alt={username !== '' ? `Image of ${username}` : 'Empty user image'} src={imageUrl} className='user-pic' />
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