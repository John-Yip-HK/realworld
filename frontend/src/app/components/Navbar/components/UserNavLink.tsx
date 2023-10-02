/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react'
import { getJsonFetch } from '@/app/lib/api/customFetch';

import NavLink from './NavLink';
import styles from '../styles.module.scss';

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
      getJsonFetch('/api/user')
        .then(({ user: { username, image } }) => {
          setUsername(username);
          setImageUrl(image);
          setAnchorClassName(undefined);
        });
    } else {
      setAnchorClassName(hideLinkClass);
    }
  }, [isAuthenticated]);

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
}