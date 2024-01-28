import type { User as PrismaUser } from '@prisma/client';

import prisma from '../../prisma/__mocks__/client';
import {
  getArticles,
  getArticlesFeed,
  getArticle,
  parseTitleToSlug,
  favoriteArticle,
  unfavoriteArticle,
} from '../../dao/articlesDao';

import type { RawArticles } from '../../controllers/articles/utils';
import type {
  GetArticleParams,
  GetArticlesFeedQueryParams,
  GetArticlesQueryParams,
} from '../../routes/Articles';

describe('getArticles', () => {
  let queryParams: GetArticlesQueryParams;

  beforeEach(() => {
    queryParams = {};  

    prisma.article.findMany.mockResolvedValueOnce([] as RawArticles);
  });

  it('should handle `tag` query parameter', async () => {
    queryParams = { tag: 'test' };
    
    await getArticles(queryParams);

    expect(prisma.article.findMany.mock.calls[0][0]?.where)
      .toStrictEqual({ tagList: { has: queryParams.tag } });
  });

  it('should handle `author` query parameter', async () => {
    queryParams = { author: 'testAuthor' };

    await getArticles(queryParams);

    expect(prisma.article.findMany.mock.calls[0][0]?.where)
      .toStrictEqual({ user: { is: { username: { equals: queryParams.author } } } });
  });

  it('should handle `favorited` query parameter if the favorited user exists', async () => {
    queryParams = { favorited: 'testUser' };
    prisma.user.findUnique.mockResolvedValueOnce({ id: 1 } as PrismaUser);

    await getArticles(queryParams);

    expect(prisma.article.findMany.mock.calls[0][0]?.where)
      .toStrictEqual({ favoritedUserIdList: { has : 1 } });
  });

  it('should throw an error if the favorited user does not exist', async () => {
    queryParams = { favorited: 'nonExistingUser' };
    prisma.user.findUnique.mockResolvedValueOnce(null);

    await expect(getArticles(queryParams)).rejects.toThrow('The favorited user does not exist.');
  });

  it('should handle `limit` and `offset` query parameters', async () => {
    queryParams = { limit: 10, offset: 0 };

    await getArticles(queryParams);

    expect(prisma.article.findMany.mock.calls[0][0])
      .toStrictEqual(expect.objectContaining({ 
        take: queryParams.limit, 
        skip: queryParams.offset 
      }));
  });

  it('should receive `undefined` for respective properties of `prisma.article.findMany` object argument when no query param is provided', async () => {
    await getArticles(queryParams);
    await getArticles();

    expect(prisma.article.findMany.mock.calls[0][0])
      .toStrictEqual(expect.objectContaining({
        where: undefined,
        take: undefined,
        skip: undefined,
      }));
    expect(prisma.article.findMany.mock.calls[1][0])
      .toStrictEqual(expect.objectContaining({
        where: undefined,
        take: undefined,
        skip: undefined,
      }));
  })
});

describe('getArticlesFeed', () => {
  let queryParams: GetArticlesFeedQueryParams;

  beforeEach(() => {
    queryParams = {};

    prisma.article.findMany.mockResolvedValueOnce([] as RawArticles);
  });

  it('should handle `limit` and `offset` query parameters', async () => {
    queryParams = {
      limit: 10,
      offset: 10,
    };
    
    await getArticlesFeed(queryParams);
    
    expect(prisma.article.findMany.mock.calls[0][0])
      .toStrictEqual(
        expect.objectContaining({
          take: queryParams.limit,
          skip: queryParams.offset,
        })
      );
  });

  it('should handle `followedUsers` in query parameters', async () => {
    queryParams = { followedUsers: [1] };

    await getArticlesFeed(queryParams);

    expect(prisma.article.findMany.mock.calls[0][0])
      .toStrictEqual(
        expect.objectContaining({
          where: {
            user: {
              id: { in: queryParams.followedUsers, },
            },
          }
        })
      );
  })

  it('should handle no query parameters', async () => {
    queryParams = {};

    await getArticlesFeed(queryParams);
    await getArticlesFeed();
    
    expect(prisma.article.findMany.mock.calls[0][0])
      .toStrictEqual(
        expect.objectContaining({
          take: undefined,
          skip: undefined,
          where: undefined,
        })
      );
    expect(prisma.article.findMany.mock.calls[1][0])
      .toStrictEqual(
        expect.objectContaining({
          take: undefined,
          skip: undefined,
          where: undefined,
        })
      );
  });
});

describe('getArticle', () => {
  let params: GetArticleParams;

  beforeEach(() => {
    params = {
      slug: 'test-article',
      includeComments: true,
    };

    // Reset the mock before each test
    prisma.article.findFirst.mockReset();
  });

  it('should handle "slug" query parameter', async () => {
    await getArticle(params);
    
    // Check if prisma.article.findFirst was called with the correct parameters
    expect(prisma.article.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: { equals: params.slug } },
        include: expect.objectContaining({ comments: params.includeComments }),
      })
    );

    // Check if prisma.article.findFirst was called only once
    expect(prisma.article.findFirst).toHaveBeenCalledTimes(1);
  });

  it('should handle "title" query parameter', async () => {
    params = { title: 'Test Article', includeComments: true };

    await getArticle(params);
    
    // Check if prisma.article.findFirst was called with the correct parameters
    expect(prisma.article.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { title: { equals: params.title } },
        include: expect.objectContaining({ comments: params.includeComments }),
      })
    );

    // Check if prisma.article.findFirst was called only once
    expect(prisma.article.findFirst).toHaveBeenCalledTimes(1);
  });

  it('should handle no query parameters - no argument', async () => {
    await getArticle();
    
    // Check if prisma.article.findFirst was called with the correct parameters
    expect(prisma.article.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
        include: expect.objectContaining({ comments: undefined }),
      })
    );

    // Check if prisma.article.findFirst was called only once
    expect(prisma.article.findFirst).toHaveBeenCalledTimes(1);
  });

  it('should handle no query parameters - argument as empty params object', async () => {
    await getArticle({});
    
    // Check if prisma.article.findFirst was called with the correct parameters
    expect(prisma.article.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
        include: expect.objectContaining({ comments: undefined }),
      })
    );

    // Check if prisma.article.findFirst was called only once
    expect(prisma.article.findFirst).toHaveBeenCalledTimes(1);
  });
});

describe('parseTitleToSlug', () => {
  it('should convert title to slug correctly', () => {
    const title = 'Test Article';
    const userId = 1;
    const result = parseTitleToSlug(title, userId);

    expect(result).toBe('test-article-1');
  });

  it('should handle title with multiple spaces', () => {
    const title = 'Test  Article   With   Spaces';
    const userId = 2;
    const result = parseTitleToSlug(title, userId);

    expect(result).toBe('test--article---with---spaces-2');
  });

  it('should handle title with uppercase letters', () => {
    const title = 'Test Article With Uppercase';
    const userId = 3;
    const result = parseTitleToSlug(title, userId);

    expect(result).toBe('test-article-with-uppercase-3');
  });
});

describe('favoriteArticle', () => {
  beforeEach(() => {
    prisma.article.update.mockResolvedValueOnce({} as any);
  });
  
  it('should add user id to favoritedUserIdList', async () => {
    const params = {
      articleId: 1,
      oldFavoritedUsersList: [2, 3],
      userId: 4,
    };

    await favoriteArticle(params);

    expect(prisma.article.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          favoritedUserIdList: [...params.oldFavoritedUsersList, params.userId],
        }),
      })
    );

    expect(prisma.article.update).toHaveBeenCalledTimes(1);
  });

  it('should not add user id to favoritedUserIdList if that id exists in `oldFavoritedUsersList`', async () => {
    const params = {
      articleId: 1,
      oldFavoritedUsersList: [2, 3],
      userId: 3,
    };

    await favoriteArticle(params);

    expect(prisma.article.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          favoritedUserIdList: params.oldFavoritedUsersList,
        }),
      })
    );

    expect(prisma.article.update).toHaveBeenCalledTimes(1);
  });
});

describe('unfavoriteArticle', () => {
  beforeEach(() => {
    prisma.article.update.mockResolvedValueOnce({} as any);
  });

  it('should remove a user id from favoritedUserIdList', async () => {
    const params = {
      articleId: 1,
      oldFavoritedUsersList: [2, 3, 4],
      userId: 4,
    };

    await unfavoriteArticle(params);

    expect(prisma.article.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          favoritedUserIdList: params.oldFavoritedUsersList.slice(0, -1),
        }),
      })
    );

    expect(prisma.article.update).toHaveBeenCalledTimes(1);
  });

  it('should use `params.oldFavoritedUsersList` for `favoritedUserIdList` if the requesting user has not favorited the article before', async () => {
    const params = {
      articleId: 1,
      oldFavoritedUsersList: [2, 3, 4],
      userId: 5,
    };

    await unfavoriteArticle(params);

    expect(prisma.article.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          favoritedUserIdList: params.oldFavoritedUsersList,
        }),
      })
    );

    expect(prisma.article.update).toHaveBeenCalledTimes(1);
  });
});
