import { useContext } from 'react';
import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai';
import { clsx } from 'clsx';

import { SharedStatesContext } from '@/app/lib/article/SharedStatesProvider';
import { followUserServerAction } from '@/app/lib/server-actions/article';
import { PROFILE_NAV_PATH } from '@/app/constants/profile';
import path from 'path';

type FollowUserBtnProps = {
  username: string;
}

export default function FollowUserBtn({
  username
}: FollowUserBtnProps) {
  const {
    followingUserStatus: [mutatingFollowStatus, setMutatingFollowStatus],
    followUserStates: [followingUser, mutateOptimisticFollowStatus],
  } = useContext(SharedStatesContext);

  const mutateFollowUser = async () => {
    setMutatingFollowStatus(true);
    mutateOptimisticFollowStatus(followingUser);
    await followUserServerAction(username, followingUser, path.join(PROFILE_NAV_PATH, username));
    setMutatingFollowStatus(false);
  }
  
  return (
    <button 
      className={
        clsx(
          'btn btn-sm btn-outline-secondary action-btn',
          followingUser ? 'following-user' : undefined,
          mutatingFollowStatus ? 'mutating-status' : undefined,
        )
      }
      onClick={mutateFollowUser}
    >
      {followingUser ? <AiOutlineMinus /> : <AiOutlinePlus />}
      &nbsp; {followingUser ? 'Unfollow' : 'Follow'} {username}
    </button>
  )
}