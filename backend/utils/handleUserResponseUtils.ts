import { type User as PrismaUser } from '@prisma/client';
import { type User as RealworldUser } from '../routes/User';

export function handleUserResponse(
  user: PrismaUser, 
  token: RealworldUser['token'], 
  needFollowedUsers?: boolean
) {
  const {
    id, 
    hashedPassword, 
    ...otherFields
  } = user;

  const remainingFields = needFollowedUsers ?
    otherFields :
    (() => {
      const { followedUsers, ...filteredFields } = otherFields;
      return filteredFields;
    })();
  
  return {
    user: { token, ...remainingFields },
  };
}

type RealworldUserWithFollowedUsersInfo = RealworldUser & Pick<PrismaUser, 'followedUsers'>;

export function hasFollowedUsers(user: RealworldUser | RealworldUserWithFollowedUsersInfo): user is RealworldUserWithFollowedUsersInfo {
  return 'followedUsers' in user;
}

export function handleProfileResponse(user: PrismaUser, following: boolean) {
  const { 
    id, 
    hashedPassword, 
    followedUsers, 
    email, 
    ...otherFields
  } = user;

  return {
    profile: {
      ...otherFields,
      following,
    },
  };
}
