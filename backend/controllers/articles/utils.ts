import type { 
  Comment as PrismaComment, 
  User as PrismaUser 
} from '@prisma/client';

import { getArticles } from '../../dao/articlesDao';
import { getUserByEmail } from '../../dao/usersDao';
import { handleProfileResponse } from '../../utils/handleUserResponseUtils';

import type { ArticleObj } from '../../routes/Articles';

export type RawArticles = ReturnType<typeof getArticles> extends Promise<infer U> ? U : never;

export function getArticleAuthorFollowStates(
  articleAuthorDetails: Pick<PrismaUser, 'email' | 'id'>,
  currentUser?: Pick<PrismaUser, 'id' | 'email' | 'followedUsers'> | null,
  ) {
    if (!currentUser) {
    return {
      isFollowingArticleAuthor: false,
    };
  }

  const { 
    email: authorEmail, 
    id: authorId, 
  } = articleAuthorDetails;
  const { 
    email: currentUserEmail 
  } = currentUser;
  const followedUsersOfCurrentUser = new Set(currentUser.followedUsers);

  const isFollowingArticleAuthor = 
    currentUserEmail !== authorEmail &&
    followedUsersOfCurrentUser.has(authorId);

  return { isFollowingArticleAuthor };
}

export function parseRawComments(
  rawCommentsOrRawComment: PrismaComment | PrismaComment[],
  articleAuthor: PrismaUser,
  currentUser?: Pick<PrismaUser, 'id' | 'email' | 'followedUsers'> | null,
) {
  const commentsToBeChecked = (rawCommentsOrRawComment instanceof Array) ?
    rawCommentsOrRawComment :
    [rawCommentsOrRawComment];
  
  return commentsToBeChecked.map(rawComment => {
    const { articleId, userId, ...otherProps } = rawComment;
    const { isFollowingArticleAuthor } = getArticleAuthorFollowStates(articleAuthor, currentUser);

    return {
      ...otherProps,
      author: handleProfileResponse(articleAuthor, isFollowingArticleAuthor).profile,
    };
  });
}

export function parseRawArticles(
  rawArticles: RawArticles,
  currentUser?: Pick<PrismaUser, 'id' | 'email' | 'followedUsers'> | null,
) {
  return rawArticles.map<ArticleObj>(article => {
    const {
      userId,
      user: articleAuthor,
      favoritedUserIdList,
      ...otherAttributes
    } = article;

    const { isFollowingArticleAuthor } = getArticleAuthorFollowStates(articleAuthor, currentUser);
    
    return {
      ...otherAttributes,
      favoritesCount: favoritedUserIdList.length,
      favorited: favoritedUserIdList.includes(currentUser?.id ?? -1),
      author: handleProfileResponse(articleAuthor, isFollowingArticleAuthor).profile,
    };
  });
}

export async function getCurrentUser(currentUserEmail?: string) {
  return currentUserEmail ? 
    getUserByEmail(currentUserEmail) :
    Promise.resolve(null);
}
