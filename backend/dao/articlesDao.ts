import { type Prisma } from '@prisma/client';

import { getUserByUsername } from './usersDao';
import prisma from '../prisma/client';

import { 
  type CreateArticleBody, 
  type UpdateArticleBody, 
  type GetArticlesFeedQueryParams, 
  type GetArticlesQueryParams, 
  type GetArticleParams 
} from '../routes/Articles';

export function parseTitleToSlug(title: string, userId: number) {
  return title
    .toLowerCase()
    .replaceAll(' ', '-')
    + `-${userId}`;
}

export async function getArticles(queryParams?: GetArticlesQueryParams) {
  const filters = 
    queryParams && 
    Object.keys(queryParams).length > 0 ? 
      await (async () => {
        const tempFilters: Prisma.ArticleWhereInput = {};
        
        if (queryParams.tag) {
          tempFilters.tagList = {
            has: queryParams.tag,
          };
        }
        if (queryParams.author) {
          tempFilters.user = {
            is: {
              username: {
                equals: queryParams.author,
              }
            }
          };
        }
        if (queryParams.favorited) {
          const idOffavoritedUser = (await getUserByUsername(queryParams.favorited))?.id;

          if (!idOffavoritedUser) {
            throw new Error('The favorited user does not exist.');
          }

          tempFilters.favoritedUserIdList = {
            has: idOffavoritedUser,
          };
        }
        
        return tempFilters;
      })() : 
      undefined;

  return await prisma.article.findMany({
    include: {
      user: true,
    },
    take: queryParams?.limit,
    skip: queryParams?.offset,
    where: filters,
    orderBy: {
      updatedAt: 'desc',
    }
  });
}

export async function getArticlesFeed(queryParams?: GetArticlesFeedQueryParams) {
  const filters: Prisma.ArticleWhereInput | undefined = queryParams?.followedUsers ?
    {
      user: {
        id: { in: queryParams.followedUsers, },
      },
    } :
    undefined;
  
  return await prisma.article.findMany({
    include: {
      user: true,
    },
    take: queryParams?.limit,
    skip: queryParams?.offset,
    where: filters,
    orderBy: {
      updatedAt: 'desc',
    }
  });
}

export async function getArticle(params?: GetArticleParams) {
  const filters: Prisma.ArticleWhereInput = {};

  if (params?.slug) {
    filters.slug = { equals: params.slug };
  } else if (params?.title) {
    filters.title = { equals: params.title };
  }
  
  return await prisma.article.findFirst({
    include: {
      user: true,
      comments: params?.includeComments,
    },
    where: filters,
  });
}

export async function createArticle(params: CreateArticleBody['article'] & { userId: number; }) {
  const slug = parseTitleToSlug(params.title, params.userId);
  
  return await prisma.article.create({
    data: {
      ...params,
      slug,
    },
    include: {
      user: true,
    },
  });
}

export async function updateArticle({ userId, articleId, oldTitle, ...params }: UpdateArticleBody['article'] & {
  oldTitle: string;
  userId: number;
  articleId: number;
}) {
  const slug = parseTitleToSlug(params.title ?? oldTitle, userId);
  
  return await prisma.article.update({
    where: {
      id: articleId,
    },
    data: {
      ...params,
      slug,
      updatedAt: new Date(),
    },
    include: {
      user: true,
    },
  });
}

export async function commentArticle(params: {
  body: string;
  articleId: number;
  userId: number;
}) {
  return await prisma.comment.create({
    data: params,
  });
}

export async function deleteComment(commentId: number) {
  return await prisma.comment.delete({
    where: { 
      id: commentId,
    },
  })
}

export async function favoriteArticle(params: {
  articleId: number;
  oldFavoritedUsersList: number[];
  userId: number;
}) {
  const favoritedUserIdList = (params.oldFavoritedUsersList.includes(params.userId)) ?
    params.oldFavoritedUsersList :
    params.oldFavoritedUsersList.concat(params.userId);
  
  return await prisma.article.update({
    where: { id: params.articleId },
    data: {
      favoritedUserIdList,
      updatedAt: new Date(),
    },
    include: { user: true },
  })
}

export async function unfavoriteArticle(params: {
  articleId: number;
  oldFavoritedUsersList: number[];
  userId: number;
}) {
  return await prisma.article.update({
    where: { id: params.articleId },
    data: {
      favoritedUserIdList: params.oldFavoritedUsersList.filter(userId => userId !== params.userId),
      updatedAt: new Date(),
    },
    include: { user: true },
  })
}

export async function deleteArticle({ articleId: id, slug }: {
  slug: string;
  articleId: number;
}) {
  return prisma.article.delete({
    where: {
      id,
      slug,
    }
  });
}
