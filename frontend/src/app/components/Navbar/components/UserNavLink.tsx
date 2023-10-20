/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react'
import { routeHandlerFetch } from '@/app/lib/api/customFetch';

import NavLink from './NavLink';
import styles from '../styles.module.scss';
import { USER_PATH } from '@/app/api/constants';

interface UserNavLinkProps {
  isAuthenticated: boolean;
};

const hideLinkClass = styles['nav-link__hidden'];

export default function UserNavLink({
  isAuthenticated
}: UserNavLinkProps) {
  const [username, setUsername] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [anchorClassName, setAnchorClassName] = useState<string | undefined>(hideLinkClass);

  useEffect(() => {
    if (isAuthenticated) {
      routeHandlerFetch(USER_PATH)
        .then(({ user: { username, image } }) => {
          setUsername(username);
          setImageUrl(image);
          setAnchorClassName(undefined);
        });
    } else {
      setAnchorClassName(hideLinkClass);
    }
  }, [isAuthenticated]);

  if (isAuthenticated) {
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
          protectedLink: true
        }}
        isActive={false}
        className={anchorClassName}
      />
    )
  } else {
    return null;
  }
}