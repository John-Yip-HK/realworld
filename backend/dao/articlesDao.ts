import { PrismaClient, type Prisma } from '@prisma/client';

import { type GetArticlesQueryParams } from '../routes/Articles';
import { getUserByUsername } from './usersDao';

const prisma = new PrismaClient();

export async function getArticles(queryParams?: GetArticlesQueryParams) {
  const filters = queryParams ? 
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
