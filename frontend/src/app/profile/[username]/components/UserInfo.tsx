'use client';

import Image from 'next/image';
import Link from 'next/link';
import { IoSettingsOutline } from "react-icons/io5";

import SharedStatesProvider from '@/app/lib/article/SharedStatesProvider';

import FollowUserBtn from './FollowUserBtn';

import './styles.scss';

type UserInfoProps = {
  profile: Profile;
  isProfileOfUser: boolean;
}

export default function UserInfo({
  profile,
  isProfileOfUser,
}: UserInfoProps) {
  const { bio, image: imageUrl, username, following } = profile;
  
  return (
    <div className="user-info">
      <div className="container">
        <div className="row">
          <div className="col-xs-12 col-md-10 offset-md-1">
            <Image 
              src={imageUrl} 
              className="user-img" 
              width={100} 
              height={100} 
              alt={`User image of ${username}`} 
            />
            <h4>{username}</h4>
            <p>{bio ?? 'This user does not have bio'}</p>
            {
              !isProfileOfUser ? 
                <SharedStatesProvider
                  initFollowing={following}
                  initFavoriteStates={{
                    slug: '', 
                    favorited: false, 
                    favoritesCount: 0,
                  }}
                >
                  <FollowUserBtn username={username} />
                </SharedStatesProvider> :
                <Link href="/settings" className="btn btn-sm btn-outline-secondary action-btn">
                  <IoSettingsOutline />
                  &nbsp; Edit Profile Settings
                </Link>
            }
          </div>
        </div>
      </div>
    </div>
  )
}