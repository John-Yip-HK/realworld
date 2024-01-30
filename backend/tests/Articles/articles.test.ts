import type { Request, Response } from 'express';
import type { User as PrismaUser } from '@prisma/client';

import { 
  createArticleController,
  getArticlesController,
  getArticlesFeedController,
  getSingleArticleController, 
} from '../../controllers/articles';
import * as articleUtils from '../../controllers/articles/utils';
import prisma from '../../prisma/__mocks__/client';

import statusCodes from '../../constants/status-codes';

import type { RequestWithCurrentUserEmail } from '../../middlewares/getJwtUserDetailsMiddleware';
import type { 
  MultipleArticlesResponse, 
  GetArticlesQueryParams,
  GetArticlesFeedQueryParams,
  CreateArticleBody,
  SingleArticleResponse,
  ArticleObj,
  ArticlePathParams,
} from '../../routes/Articles';
import { parseTitleToSlug } from '../../dao/articlesDao';

const { NOT_FOUND, BAD_REQUEST, INTERNAL_SERVER_ERROR } = statusCodes;

const { parseRawArticles } = articleUtils;
type RawArticles = articleUtils.RawArticles;
type RawArticle = RawArticles[number];

describe('getArticlesController', () => {
  let req: RequestWithCurrentUserEmail<void, MultipleArticlesResponse, void, GetArticlesQueryParams>;
  let res: Response<MultipleArticlesResponse>;
  let currentUser: PrismaUser;
  let anotherUser: PrismaUser;
  let rawArticles: RawArticles;
  
  beforeEach(() => {
    req = {
      currentUserEmail: 'test@test.com',
      query: {},
    } as unknown as RequestWithCurrentUserEmail<void, MultipleArticlesResponse, void, GetArticlesQueryParams>;
    
    res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as Response<MultipleArticlesResponse>;
  
    currentUser = {
      id: 1,
      email: 'test@test.com', 
      followedUsers: [],
    } as unknown as PrismaUser;

    anotherUser = {
      id: 2,
      email: 'test2@test.com', 
      followedUsers: [],
    } as unknown as PrismaUser;
  });

  it('should return the articles and the count of articles', async () => {
    delete (req as any).query;
    rawArticles = [
      { 
        id: 1,
        slug: 'test',
        title: 'test', 
        description: 'test', 
        body: 'test', 
        tagList: [], 
        createdAt: new Date(), 
        updatedAt: new Date(), 
        favoritedUserIdList: [],
        userId: 1,
        user: currentUser,
      }
    ];
    const articles = parseRawArticles(rawArticles, currentUser);
    
    prisma.user.findUnique.mockResolvedValueOnce(currentUser);
    prisma.article.findMany.mockResolvedValueOnce(rawArticles);

    await getArticlesController(req, res);

    expect(res.send).toHaveBeenCalledOnce();
    expect(res.send).toHaveBeenCalledWith({
      articles,
      articlesCount: articles.length,
    });
  });

  it('should return the articles and the count of articles with the first article having a following author', async () => {
    currentUser.followedUsers = [anotherUser.id];
    rawArticles = [
      { 
        id: 1,
        slug: 'test-2',
        title: 'test 2', 
        description: 'test two', 
        body: 'another test article', 
        tagList: [], 
        createdAt: new Date(), 
        updatedAt: new Date(), 
        favoritedUserIdList: [],
        userId: anotherUser.id,
        user: anotherUser,
      },
      { 
        id: 2,
        slug: 'test',
        title: 'test', 
        description: 'test', 
        body: 'test', 
        tagList: [], 
        createdAt: new Date(), 
        updatedAt: new Date(), 
        favoritedUserIdList: [],
        userId: currentUser.id,
        user: currentUser,
      }
    ];
    const articles = parseRawArticles(rawArticles, currentUser);
    
    prisma.user.findUnique.mockResolvedValueOnce(currentUser);
    prisma.article.findMany.mockResolvedValueOnce(rawArticles);

    await getArticlesController(req, res);

    expect(res.send).toHaveBeenCalledOnce();
    expect(res.send).toHaveBeenCalledWith({
      articles,
      articlesCount: articles.length,
    });
    expect(articles[0].author.following).toBeTruthy();
  });

  it('should return the articles and the count of articles with favorited first article', async () => {
    rawArticles = [
      { 
        id: 1,
        slug: 'test-2',
        title: 'test 2', 
        description: 'test two', 
        body: 'another test article', 
        tagList: [], 
        createdAt: new Date(), 
        updatedAt: new Date(), 
        favoritedUserIdList: [currentUser.id],
        userId: anotherUser.id,
        user: anotherUser,
      },
      { 
        id: 2,
        slug: 'test',
        title: 'test', 
        description: 'test', 
        body: 'test', 
        tagList: [], 
        createdAt: new Date(), 
        updatedAt: new Date(), 
        favoritedUserIdList: [anotherUser.id],
        userId: currentUser.id,
        user: currentUser,
      }
    ];
    const articles = parseRawArticles(rawArticles, currentUser);
    
    prisma.user.findUnique.mockResolvedValueOnce(currentUser);
    prisma.article.findMany.mockResolvedValueOnce(rawArticles);

    await getArticlesController(req, res);

    expect(res.send).toHaveBeenCalledOnce();
    expect(res.send).toHaveBeenCalledWith({
      articles,
      articlesCount: articles.length,
    });
    expect(articles[0].favorited).toBeTruthy();
    expect(articles[0].favoritesCount).toBe(1);
  });

  it('should throw NOT_FOUND if the favorited user does not exist', async () => {
    const error = new Error('The favorited user does not exist.');
    req.query = { favorited: 'other-user' };

    prisma.user.findUnique
      .mockResolvedValueOnce(currentUser)
      .mockResolvedValueOnce(null);

    await getArticlesController(req, res);

    expect(prisma.user.findUnique.mock.calls[1][0].where).toEqual({ username: req.query.favorited });

    expect(res.status).toHaveBeenCalledWith(NOT_FOUND.code);
    expect(res.send).toHaveBeenCalledWith({
      error: NOT_FOUND.message,
      details: error.message,
    });
  });

  it('should throw BAD_REQUEST for other errors with Error type', async () => {
    const error = new Error('Some other error.');

    prisma.user.findUnique.mockRejectedValueOnce(error);

    await getArticlesController(req, res);

    expect(res.status).toHaveBeenCalledWith(BAD_REQUEST.code);
    expect(res.send).toHaveBeenCalledWith({
      error: BAD_REQUEST.message,
      details: JSON.stringify(error),
    });
  });

  it('should throw INTERNAL_SERVER_ERROR for other errors', async () => {
    const error = 'Non-Error error';

    prisma.user.findUnique.mockRejectedValueOnce(error);

    await getArticlesController(req, res);

    expect(res.status).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR.code);
    expect(res.send).toHaveBeenCalledWith({
      error: INTERNAL_SERVER_ERROR.message,
      details: JSON.stringify(error),
    });
  });
});

describe('getArticlesFeedController', () => {
  let req: Request<void, MultipleArticlesResponse, void, GetArticlesFeedQueryParams>;
  let res: Response<MultipleArticlesResponse>;
  let currentUser: PrismaUser;
  let rawArticles: RawArticles;

  beforeEach(() => {
    req = {
      user: { email: 'test@test.com' },
    } as Request<void, MultipleArticlesResponse, void, GetArticlesFeedQueryParams>;

    res = {
      send: vi.fn(),
      status: vi.fn().mockReturnThis(),
    } as unknown as Response<MultipleArticlesResponse>;

    currentUser = {
      id: 1,
      email: 'test@test.com', 
      followedUsers: [],
    } as unknown as PrismaUser;
  })
  
  test('should handle successful request', async () => {
    rawArticles = [
      { 
        id: 1,
        slug: 'test',
        title: 'test', 
        description: 'test', 
        body: 'test', 
        tagList: [], 
        createdAt: new Date(), 
        updatedAt: new Date(), 
        favoritedUserIdList: [],
        userId: 1,
        user: currentUser,
      }
    ];
    
    prisma.user.findUnique.mockResolvedValueOnce(currentUser);
    prisma.article.findMany.mockResolvedValueOnce(rawArticles);

    const articles = parseRawArticles(rawArticles, currentUser);
    
    await getArticlesFeedController(req, res)

    expect(prisma.user.findUnique.mock.calls[0][0].where.email).toEqual(req.user!.email);
    expect(prisma.article.findMany.mock.calls[0][0]?.where?.user).toStrictEqual({
      id: { in: currentUser.followedUsers },
    });
    expect(res.send).toHaveBeenCalledWith({
      articles,
      articlesCount: articles.length,
    });
  })

  test('should handle BAD_REQUEST error', async () => {
    prisma.user.findUnique.mockRejectedValueOnce(new Error('Test error'));

    await getArticlesFeedController(req, res)

    expect(res.status).toHaveBeenCalledWith(BAD_REQUEST.code)
    expect(res.send).toHaveBeenCalledWith({
      error: BAD_REQUEST.message,
      details: JSON.stringify(new Error('Test error')),
    })
  })

  test('should handle INTERNAL_REQUEST_ERROR error', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);

    await getArticlesFeedController(req, res)

    expect(res.status).toHaveBeenCalledWith(BAD_REQUEST.code)
    expect(res.send).toHaveBeenCalledWith({
      error: BAD_REQUEST.message,
      details: JSON.stringify(new Error('Test error')),
    })
  })
})

describe('createArticleController', () => {
  let req: Request<void, SingleArticleResponse, CreateArticleBody, void>;
  let res: Response<SingleArticleResponse>;
  let currentUser: PrismaUser;
  let article: ArticleObj;
  
  beforeEach(() => {
    currentUser = {
      id: 1,
      email: 'test@test.com',
      followedUsers: [],
    } as unknown as PrismaUser;

    req = {
      user: { email: currentUser.email },
      body: {
        article: {
          title: 'Test Article',
          description: 'Test Description',
          body: 'Test Body',
          tagList: ['Test'],
        },
      },
    } as unknown as Request<void, SingleArticleResponse, CreateArticleBody, void>;

    res = {
      send: vi.fn(),
      status: vi.fn().mockReturnThis(),
    } as unknown as Response<SingleArticleResponse>;

    article = {} as ArticleObj;

    vi.spyOn(articleUtils, 'parseRawArticles').mockReturnValueOnce([article]);
  })
  
  test('should handle successful request', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(currentUser);
    prisma.article.findFirst.mockResolvedValueOnce(null);
    prisma.article.create.mockResolvedValueOnce({} as RawArticles[number]);

    const { id: userId } = currentUser;
    const articleParams = req.body.article;
    const { title: articleTitle } = articleParams;
    const newArticleSlug = parseTitleToSlug(articleTitle, userId);
    
    await createArticleController(req, res);

    expect(prisma.user.findUnique.mock.calls[0][0].where)
      .toStrictEqual({ email: req.user!.email });
    expect(prisma.article.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          title: {
            equals: req.body.article.title,
          }
        }
      })
    );
    expect(prisma.article.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          ...articleParams,
          userId,
          slug: newArticleSlug,
        }
      })
    );
    expect(res.send).toHaveBeenCalledWith({
      article,
    });
  })

  test('should handle case when article with the same title already exists', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(currentUser);
    prisma.article.findFirst.mockResolvedValueOnce({
      id: 1,
      slug: 'test-article',
      title: 'Test Article',
      description: 'Test Description',
      body: 'Test Body',
      tagList: ['Test'],
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 1,
      favoritedUserIdList: [],
    });

    await createArticleController(req, res);

    expect(prisma.article.findFirst.mock.calls[0][0]?.where).toStrictEqual({
      title: { equals: req.body.article.title }
    });
    expect(res.status).toHaveBeenCalledWith(BAD_REQUEST.code);
    expect(res.send).toHaveBeenCalledWith({
      error: BAD_REQUEST.message,
      details: 'Article with the same title already exists.',
    });
  })

  test('should handle INTERNAL_SERVER_ERROR', async () => {
    prisma.user.findUnique.mockRejectedValueOnce(new Error('Test error'));

    await createArticleController(req, res)

    expect(res.status).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR.code)
    expect(res.send).toHaveBeenCalledWith({
      error: INTERNAL_SERVER_ERROR.message,
      details: JSON.stringify(new Error('Test error')),
    })
  })
})

describe('getSingleArticleController', () => {
  let req: RequestWithCurrentUserEmail<ArticlePathParams, SingleArticleResponse, void, void>;
  let res: Response<SingleArticleResponse>;
  let currentUser: PrismaUser;
  let rawArticle: RawArticle;
  let article: ArticleObj;

  beforeEach(() => {
    currentUser = {
      email: 'test@test.com',
      id: 1,
    } as unknown as PrismaUser;
    
    req = {
      currentUserEmail: currentUser.email,
      params: { slug: `test-article-${currentUser}` },
    } as unknown as RequestWithCurrentUserEmail<ArticlePathParams, SingleArticleResponse, void, void>;

    res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as Response<SingleArticleResponse>;

    rawArticle = {
      id: 1,
      slug: req.params.slug,
      userId: currentUser.id,
      title: 'Test Article',
      description: 'Test Description',
      body: 'Test Body',
      tagList: ['Test'],
      createdAt: new Date(),
      updatedAt: new Date(),
      favoritedUserIdList: [],
      user: {
        username: 'test', bio: null, image: '',
        id: 0,
        email: '',
        hashedPassword: '',
        followedUsers: []
      },
    };

    article = {} as ArticleObj;

    vi.spyOn(articleUtils, 'parseRawArticles').mockReturnValueOnce([article]);
  });

  test('should return a single article', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(currentUser);
    prisma.article.findFirst.mockResolvedValueOnce(rawArticle);
    
    await getSingleArticleController(req, res);

    expect(prisma.user.findUnique.mock.calls[0][0]?.where)
      .toStrictEqual({ email: req.currentUserEmail });
    expect(prisma.article.findFirst.mock.calls[0][0]?.where)
      .toStrictEqual({ slug: { equals: req.params.slug } });
    expect(res.send).toHaveBeenCalledWith({ article });
  });

  test('should return NOT_FOUND when article does not exist', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(currentUser);
    prisma.article.findFirst.mockResolvedValueOnce(null);
    
    await getSingleArticleController(req, res);

    expect(res.status).toHaveBeenCalledWith(NOT_FOUND.code);
    expect(res.send).toHaveBeenCalledWith({
      error: NOT_FOUND.message,
      details: 'Such article does not exist.',
    });
  });

  test('should handle INTERNAL_SERVER_ERROR', async () => {
    prisma.user.findUnique.mockRejectedValueOnce(new Error('Test error'));

    await getSingleArticleController(req, res);

    expect(res.status).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR.code);
    expect(res.send).toHaveBeenCalledWith({
      error: INTERNAL_SERVER_ERROR.message,
      details: JSON.stringify(new Error('Test error')),
    });
  });
});
