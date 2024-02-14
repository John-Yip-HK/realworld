import type { Request, Response } from 'express';
import type { User as PrismaUser, Article as PrismaArticle } from '@prisma/client';

import { 
  createArticleCommentController,
  createArticleController,
  deleteArticleCommentController,
  deleteArticleController,
  favoriteArticleController,
  getArticleCommentsController,
  getArticlesController,
  getArticlesFeedController,
  getSingleArticleController,
  unfavoriteArticleController,
  updateArticleController, 
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
  UpdateArticleBody,
  DeleteArticleResponse,
  MultipleCommentsResponse,
  AddCommentBody,
  SingleCommentResponse,
  CommentIdPathParam,
} from '../../routes/Articles';
import { parseTitleToSlug } from '../../dao/articlesDao';
import { ResponseObj } from '../../globals';

const { NOT_FOUND, BAD_REQUEST, INTERNAL_SERVER_ERROR, FORBIDDEN, NO_CONTENT } = statusCodes;

const { parseRawArticles, parseRawComments } = articleUtils;
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

describe('updateArticleController', () => {
  let req: Request<ArticlePathParams, SingleArticleResponse, UpdateArticleBody, void>;
  let res: Response<SingleArticleResponse>;
  let currentUser: PrismaUser;
  let rawArticle: RawArticle;

  beforeEach(() => {
    req = {
      user: { email: 'test@test.com' },
      params: { slug: 'test-article' },
      body: {
        article: {
          title: 'Updated Article',
          description: 'Updated Description',
          body: 'Updated Body',
          tagList: ['Updated']
        }
      },
    } as unknown as Request<ArticlePathParams, SingleArticleResponse, UpdateArticleBody, void>;

    res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as Response<SingleArticleResponse>;

    currentUser = {
      email: 'test@test.com',
      id: 1,
    } as PrismaUser;

    rawArticle = {
      title: 'Test Article',
      slug: parseTitleToSlug('Test Article', currentUser.id),
      description: 'Test Description',
      body: 'Test Body',
      tagList: ['Test'],
      createdAt: new Date(),
      updatedAt: new Date(),
      favoritedUserIdList: [],
      userId: currentUser.id,
      user: currentUser,
      id: 1,
    };

    vi.spyOn(articleUtils, 'parseRawArticles').mockReturnValueOnce([
      rawArticle as unknown as ArticleObj
    ]);
    prisma.user.findUnique.mockResolvedValueOnce(currentUser);
  });

  test('should update an article', async () => {
    const updateDetails = req.body.article;
    const updatedArticleSlug = parseTitleToSlug(updateDetails.title!, currentUser.id);
    
    prisma.article.findFirst.mockResolvedValueOnce(rawArticle);
    prisma.article.update.mockResolvedValueOnce({
      ...rawArticle,
      ...updateDetails,
      slug: updatedArticleSlug,
    });
    
    await updateArticleController(req, res);

    expect(prisma.user.findUnique.mock.calls[0][0].where).toStrictEqual({ email: req.user!.email });
    expect(prisma.article.findFirst.mock.calls[0][0]?.where).toStrictEqual({ slug: { equals: req.params.slug } });
    expect(prisma.article.update).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ...updateDetails,
        slug: updatedArticleSlug,
      }),
      where: {
        id: rawArticle.id,
      },
      include: {
        user: true,
      },
    });
    expect(prisma.article.update.mock.calls[0][0].data).toHaveProperty('updatedAt');
    expect(res.send).toHaveBeenCalledWith({ article: rawArticle });
  });

  test('should return NOT_FOUND when article does not exist', async () => {
    prisma.article.findFirst.mockResolvedValueOnce(null);

    await updateArticleController(req, res);

    expect(res.status).toHaveBeenCalledWith(NOT_FOUND.code);
    expect(res.send).toHaveBeenCalledWith({
      error: NOT_FOUND.message,
      details: 'This article does not exist.',
    });
  });

  test('should return FORBIDDEN when article does not belong to the current user', async () => {
    prisma.article.findFirst.mockResolvedValueOnce({
      ...rawArticle,
      userId: 2,
    });

    await updateArticleController(req, res);

    expect(res.status).toHaveBeenCalledWith(FORBIDDEN.code);
    expect(res.send).toHaveBeenCalledWith({
      error: FORBIDDEN.message,
      details: 'This article does not belong to the current user.',
    });
  });

  test('should handle INTERNAL_SERVER_ERROR', async () => {
    prisma.article.findFirst.mockRejectedValueOnce(new Error('Test error'));

    await updateArticleController(req, res);

    expect(res.status).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR.code);
    expect(res.send).toHaveBeenCalledWith({
      error: INTERNAL_SERVER_ERROR.message,
      details: JSON.stringify(new Error('Test error')),
    });
  });
});

describe('deleteArticleController', () => {
  let req: Request<ArticlePathParams, DeleteArticleResponse, void, void>;
  let res: Response<DeleteArticleResponse>;
  let currentUser: PrismaUser;
  let articleToBeDeleted: RawArticle;

  beforeEach(() => {
    currentUser = {
      email: 'test@test.com',
      id: 1,
    } as PrismaUser;
    
    req = {
      user: { email: currentUser.email },
      params: { slug: 'test-article' },
    } as unknown as Request<ArticlePathParams, DeleteArticleResponse, void, void>;

    res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
      sendStatus: vi.fn(),
    } as unknown as Response<DeleteArticleResponse>;

    articleToBeDeleted = {
      slug: req.params.slug,
      id: 1,
      userId: currentUser.id,
    } as RawArticle;

    prisma.user.findUnique.mockResolvedValueOnce(currentUser);
  });

  test('should delete an article', async () => {
    prisma.article.findFirst.mockResolvedValueOnce(articleToBeDeleted);
    prisma.article.delete.mockResolvedValueOnce(undefined as any);

    const { userId, ...articleTBDParams } = articleToBeDeleted;
    
    await deleteArticleController(req, res);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: req.user!.email } });
    expect(prisma.article.findFirst).toHaveBeenCalledWith({
      include: {
        user: true,
        comments: undefined,
      },
      where: { slug: { equals: req.params.slug } }, 
    });
    expect(prisma.article.delete).toHaveBeenCalledWith({ where: articleTBDParams });
    expect(res.sendStatus).toHaveBeenCalledWith(NO_CONTENT.code);
  });

  test('should return NOT_FOUND when article does not exist', async () => {
    prisma.article.findFirst.mockResolvedValueOnce(null);

    await deleteArticleController(req, res);

    expect(res.status).toHaveBeenCalledWith(NOT_FOUND.code);
    expect(res.send).toHaveBeenCalledWith({
      error: NOT_FOUND.message,
      details: 'This article does not exist.',
    });
  });

  test('should return FORBIDDEN when article does not belong to the current user', async () => {
    prisma.article.findFirst.mockResolvedValueOnce({ 
      ...articleToBeDeleted,
      userId: 2,
    });

    await deleteArticleController(req, res);

    expect(res.status).toHaveBeenCalledWith(FORBIDDEN.code);
    expect(res.send).toHaveBeenCalledWith({
      error: FORBIDDEN.message,
      details: 'This article does not belong to the current user.',
    });
  });

  test('should handle error', async () => {
    prisma.article.findFirst.mockRejectedValueOnce(new Error('Test error'));

    await deleteArticleController(req, res);

    expect(res.status).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR.code);
    expect(res.send).toHaveBeenCalledWith({
      error: INTERNAL_SERVER_ERROR.message,
      details: JSON.stringify(new Error('Test error')),
    });
  });
});

describe('getArticleCommentsController', () => {
  let req: RequestWithCurrentUserEmail<ArticlePathParams, MultipleCommentsResponse, void, void>;
  let res: Response<MultipleCommentsResponse>;
  let currentUser: PrismaUser;
  let parsedComments: ReturnType<typeof parseRawComments>;

  beforeEach(() => {
    req = {
      currentUserEmail: 'test@test.com',
      params: { slug: 'test-article' },
    } as unknown as RequestWithCurrentUserEmail<ArticlePathParams, MultipleCommentsResponse, void, void>;

    res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as Response<MultipleCommentsResponse>;

    currentUser = {
      id: 1,
      username: 'test',
      email: 'test@test.com',
      hashedPassword: 'hashedPassword',
      bio: null,
      image: '',
      followedUsers: [],
    };
    prisma.user.findUnique.mockResolvedValueOnce(currentUser);

    parsedComments = [
      {
        author: {
          following: false,
          username: 'test',
          bio: null,
          image: '',
        },
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        body: 'Test Comment',
      },
      {
        author: {
          following: false,
          username: 'test',
          bio: null,
          image: '',
        },
        id: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        body: 'Another Comment',
      },
      {
        author: {
          following: false,
          username: 'test',
          bio: null,
          image: '',
        },
        id: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
        body: 'Yet Another Comment',
      },
    ];
    vi.spyOn(articleUtils, 'parseRawComments').mockReturnValueOnce(parsedComments);
  });

  test('should get comments of an article', async () => {
    prisma.article.findFirst.mockResolvedValueOnce({
      id: 1,
      slug: 'test-article',
      title: 'Test Article',
      description: 'This is a test article',
      body: 'Lorem ipsum dolor sit amet',
      tagList: ['test', 'article'],
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 1,
      favoritedUserIdList: [1, 2, 3],
    });
    
    await getArticleCommentsController(req, res);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        email: req.currentUserEmail,
      },
    });
    expect(prisma.article.findFirst).toHaveBeenCalledWith({
      where: {
        slug: {
          equals: req.params.slug,
        },
      },
      include: {
        comments: true,
        user: true,
      },
    });
    expect(res.send).toHaveBeenCalledWith({
      comments: parsedComments,
    });
  });

  test('should return NOT_FOUND when article does not exist', async () => {
    prisma.article.findFirst.mockResolvedValueOnce(null);

    await getArticleCommentsController(req, res);

    expect(res.status).toHaveBeenCalledWith(NOT_FOUND.code);
    expect(res.send).toHaveBeenCalledWith({
      error: NOT_FOUND.message,
      details: 'Such article does not exist.',
    });
  });

  test('should handle INTERNAL_SERVER_ERROR', async () => {
    prisma.article.findFirst.mockRejectedValueOnce(new Error('Test error'));

    await getArticleCommentsController(req, res);

    expect(res.status).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR.code);
    expect(res.send).toHaveBeenCalledWith({
      error: INTERNAL_SERVER_ERROR.message,
      details: JSON.stringify(new Error('Test error')),
    });
  });
});

describe('createArticleCommentController', () => {
  let req: Request<ArticlePathParams, SingleCommentResponse, AddCommentBody, void>;
  let res: Response<SingleCommentResponse>;
  let currentUser: PrismaUser;
  let parsedComments: ReturnType<typeof parseRawComments>;
  let retrievedArticle: PrismaArticle;

  beforeEach(() => {
    req = {
      user: { email: 'test@test.com' },
      params: { slug: 'test-article' },
      body: { comment: { body: 'Test Comment' } },
    } as unknown as Request<ArticlePathParams, SingleCommentResponse, AddCommentBody, void>;

    res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as Response<SingleCommentResponse>;

    currentUser = {
      id: 1,
      username: 'test',
      email: 'test@test.com',
      hashedPassword: 'hashedPassword',
      bio: null,
      image: '',
      followedUsers: [],
    };
    prisma.user.findUnique.mockResolvedValueOnce(currentUser);

    parsedComments = [
      {
        author: {
          following: false,
          username: 'test',
          bio: null,
          image: '',
        },
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        body: 'Test Comment',
      },
    ];
    vi.spyOn(articleUtils, 'parseRawComments').mockReturnValueOnce(parsedComments);

    retrievedArticle = {
      id: 1,
      slug: req.params.slug,
      title: 'Test Article',
      description: 'This is a test article',
      body: 'Lorem ipsum dolor sit amet',
      tagList: ['test', 'article'],
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 1,
      favoritedUserIdList: [1, 2, 3],
    };
  });

  test('should create a comment for an article', async () => {
    prisma.article.findFirst.mockResolvedValueOnce(retrievedArticle);
    
    await createArticleCommentController(req, res);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        email: req.user!.email,
      },
    });
    expect(prisma.article.findFirst).toHaveBeenCalledWith({
      where: {
        slug: {
          equals: req.params.slug,
        },
      },
      include: {
        user: true,
        comments: undefined,
      }
    });
    expect(prisma.comment.create).toHaveBeenCalledWith({
      data: {
        body: req.body.comment.body,
        userId: currentUser.id,
        articleId: retrievedArticle.id,
      },
    });
    expect(res.send).toHaveBeenCalledWith({
      comment: parsedComments[0],
    });
  });

  test('should return NOT_FOUND when article does not exist', async () => {
    prisma.article.findFirst.mockResolvedValueOnce(null);

    await createArticleCommentController(req, res);

    expect(res.status).toHaveBeenCalledWith(NOT_FOUND.code);
    expect(res.send).toHaveBeenCalledWith({
      error: NOT_FOUND.message,
      details: 'Such article does not exist.',
    });
  });

  test('should handle INTERNAL_SERVER_ERROR', async () => {
    prisma.article.findFirst.mockRejectedValueOnce(new Error('Test error'));

    await createArticleCommentController(req, res);

    expect(res.status).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR.code);
    expect(res.send).toHaveBeenCalledWith({
      error: INTERNAL_SERVER_ERROR.message,
      details: JSON.stringify(new Error('Test error')),
    });
  });
});

describe('deleteArticleCommentController', () => {
  let req: Request<ArticlePathParams & CommentIdPathParam, ResponseObj<void>, void, void>;
  let res: Response<ResponseObj<void>>;
  let currentUser: PrismaUser;
  let mockArticle: PrismaArticle & {
    comments: {
      id: number;
      createdAt: Date;
      updatedAt: Date;
      body: string;
      userId: number;
      articleId: number;
    }[]
  };

  beforeEach(() => {
    currentUser = {
      id: 1,
      username: 'test',
      email: 'test@test.com',
      hashedPassword: 'hashedPassword',
      bio: null,
      image: '',
      followedUsers: [],
    };

    mockArticle = {
      id: 1,
      slug: 'test-article',
      title: 'Test Article',
      description: 'This is a test article',
      body: 'Lorem ipsum dolor sit amet',
      tagList: ['test', 'article'],
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 1,
      favoritedUserIdList: [1, 2, 3],
      comments: [
        {
          id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          body: 'This is a dummy comment',
          userId: currentUser.id,
          articleId: 1,
        }
      ],
    };
    
    req = {
      user: { email: currentUser.email },
      params: {
        slug: mockArticle.slug,
        commentId: `${mockArticle.id}`,
      },
    } as unknown as Request<ArticlePathParams & CommentIdPathParam, ResponseObj<void>, void, void>;

    res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
      sendStatus: vi.fn(),
    } as unknown as Response<ResponseObj<void>>;

    prisma.user.findUnique.mockResolvedValueOnce(currentUser);
  });

  test('should delete a comment of an article', async () => {
    prisma.article.findFirst.mockResolvedValueOnce(mockArticle);
    
    await deleteArticleCommentController(req, res);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: req.user!.email },
    });
    expect(prisma.article.findFirst).toHaveBeenCalledWith({
      where: {
        slug: {
          equals: req.params.slug,
        },
      },
      include: { 
        comments: true,
        user: true,
      },
    });
    expect(prisma.comment.delete).toHaveBeenCalledWith({
      where: { id: +req.params.commentId },
    });
    expect(res.sendStatus).toHaveBeenCalledWith(204);
  });

  test('should return NOT_FOUND when article does not exist', async () => {
    prisma.article.findFirst.mockResolvedValueOnce(null);

    await deleteArticleCommentController(req, res);

    expect(res.status).toHaveBeenCalledWith(NOT_FOUND.code);
    expect(res.send).toHaveBeenCalledWith({
      error: NOT_FOUND.message,
      details: 'Such article does not exist.',
    });
  });

  test('should return NOT_FOUND when comment does not exist', async () => {
    const copiedMockArticle = structuredClone(mockArticle);
    copiedMockArticle.comments[0].id = 2;

    prisma.article.findFirst.mockResolvedValueOnce(copiedMockArticle);

    await deleteArticleCommentController(req, res);

    expect(res.status).toHaveBeenCalledWith(NOT_FOUND.code);
    expect(res.send).toHaveBeenCalledWith({
      error: NOT_FOUND.message,
      details: 'Such comment does not exist.',
    });
  });

  test('should return FORBIDDEN when user tries to delete other user\'s comment', async () => {
    const copiedMockArticle = structuredClone(mockArticle);
    copiedMockArticle.comments[0].userId = 2;
    
    prisma.article.findFirst.mockResolvedValueOnce(copiedMockArticle);

    await deleteArticleCommentController(req, res);

    expect(res.status).toHaveBeenCalledWith(FORBIDDEN.code);
    expect(res.send).toHaveBeenCalledWith({
      error: FORBIDDEN.message,
      details: 'Cannot delete other user\'s comment.',
    });
  });

  test('should handle INTERNAL_SERVER_ERROR', async () => {
    prisma.article.findFirst.mockRejectedValueOnce(new Error('Test error'));

    await deleteArticleCommentController(req, res);

    expect(res.status).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR.code);
    expect(res.send).toHaveBeenCalledWith({
      error: INTERNAL_SERVER_ERROR.message,
      details: JSON.stringify(new Error('Test error')),
    });
  });
});

describe('favoriteArticleController', () => {
  let req: Request<ArticlePathParams, SingleArticleResponse, void>;
  let res: Response<SingleArticleResponse>;
  let currentUser: PrismaUser;
  let mockArticle: PrismaArticle;
  let updatedArticle: PrismaArticle;
  let updatedAtDateObject: Date;
  let updatedFavoritedUserIdList: number[];

  beforeEach(() => {
    currentUser = {
      id: 1,
      username: 'test',
      email: 'test@test.com',
      hashedPassword: 'hashedPassword',
      bio: null,
      image: '',
      followedUsers: [],
    };

    mockArticle = {
      id: 1,
      slug: 'test-article',
      title: 'Test Article',
      description: 'This is a test article',
      body: 'Lorem ipsum dolor sit amet',
      tagList: ['test', 'article'],
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 1,
      favoritedUserIdList: [2, 3],
    };
    
    req = {
      user: { email: currentUser.email },
      params: { slug: mockArticle.slug },
    } as unknown as Request<ArticlePathParams, SingleArticleResponse, void>;

    res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as Response<SingleArticleResponse>;

    updatedFavoritedUserIdList = mockArticle.favoritedUserIdList.concat(currentUser.id);
    updatedArticle = {
      ...mockArticle,
      favoritedUserIdList: updatedFavoritedUserIdList,
    };

    vi.spyOn(articleUtils, 'parseRawArticles').mockReturnValueOnce([
      updatedArticle as unknown as ArticleObj
    ]);

    updatedAtDateObject = new Date();

    vi.useFakeTimers();
    vi.setSystemTime(updatedAtDateObject);

    prisma.user.findUnique.mockResolvedValueOnce(currentUser);
  });

  afterEach(() => {
    vi.useRealTimers();
  })

  test('should favorite an article', async () => {
    prisma.article.findFirst.mockResolvedValueOnce(mockArticle);
    prisma.article.update.mockResolvedValueOnce(mockArticle);
    
    await favoriteArticleController(req, res);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: req.user!.email },
    });
    expect(prisma.article.findFirst).toHaveBeenCalledWith({
      include: {
        user: true,
        comments: undefined,
      },
      where: { slug: { equals: req.params.slug } },
    });
    expect(prisma.article.update).toHaveBeenCalledWith({
      where: { id: mockArticle.id },
      data: {
        favoritedUserIdList: updatedFavoritedUserIdList,
        updatedAt: updatedAtDateObject,
      },
      include: { user: true },
    });
    expect(res.send).toHaveBeenCalledWith({
      article: updatedArticle,
    });
  });

  test('should not update an article if it is already liked', async () => {
    prisma.article.findFirst.mockResolvedValueOnce(updatedArticle);
    
    await favoriteArticleController(req, res);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: req.user!.email },
    });
    expect(prisma.article.findFirst).toHaveBeenCalledWith({
      include: {
        user: true,
        comments: undefined,
      },
      where: { slug: { equals: req.params.slug } },
    });
    expect(res.send).toHaveBeenCalledWith({
      article: updatedArticle,
    });
    expect(prisma.article.update).not.toHaveBeenCalled();
  });

  test('should return NOT_FOUND when article does not exist', async () => {
    prisma.article.findFirst.mockResolvedValueOnce(null);

    await favoriteArticleController(req, res);

    expect(res.status).toHaveBeenCalledWith(NOT_FOUND.code);
    expect(res.send).toHaveBeenCalledWith({
      error: NOT_FOUND.message,
      details: 'This article does not exist.',
    });
  });

  test('should handle INTERNAL_SERVER_ERROR', async () => {
    prisma.article.findFirst.mockRejectedValueOnce(new Error('Test error'));

    await favoriteArticleController(req, res);

    expect(res.status).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR.code);
    expect(res.send).toHaveBeenCalledWith({
      error: INTERNAL_SERVER_ERROR.message,
      details: JSON.stringify(new Error('Test error')),
    });
  });
});

describe('unfavoriteArticleController', () => {
  let req: Request<ArticlePathParams, SingleArticleResponse, void>;
  let res: Response<SingleArticleResponse>;
  let currentUser: PrismaUser;
  let mockArticle: PrismaArticle;
  let updatedArticle: PrismaArticle;
  let updatedAtDateObject: Date;
  let updatedFavoritedUserIdList: number[];

  beforeEach(() => {
    currentUser = {
      id: 1,
      username: 'test',
      email: 'test@test.com',
      hashedPassword: 'hashedPassword',
      bio: null,
      image: '',
      followedUsers: [],
    };

    mockArticle = {
      id: 1,
      slug: 'test-article',
      title: 'Test Article',
      description: 'This is a test article',
      body: 'Lorem ipsum dolor sit amet',
      tagList: ['test', 'article'],
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 1,
      favoritedUserIdList: [1, 2, 3],
    };
    
    req = {
      user: { email: currentUser.email },
      params: { slug: mockArticle.slug },
    } as unknown as Request<ArticlePathParams, SingleArticleResponse, void>;

    res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as Response<SingleArticleResponse>;

    updatedFavoritedUserIdList = mockArticle.favoritedUserIdList.filter(id => id !== currentUser.id);
    updatedArticle = {
      ...mockArticle,
      favoritedUserIdList: updatedFavoritedUserIdList,
    };

    vi.spyOn(articleUtils, 'parseRawArticles').mockReturnValueOnce([
      updatedArticle as unknown as ArticleObj
    ]);

    updatedAtDateObject = new Date();

    vi.useFakeTimers();
    vi.setSystemTime(updatedAtDateObject);

    prisma.user.findUnique.mockResolvedValueOnce(currentUser);
  });

  afterEach(() => {
    vi.useRealTimers();
  })

  test('should unfavorite an article', async () => {
    prisma.article.findFirst.mockResolvedValueOnce(mockArticle);
    prisma.article.update.mockResolvedValueOnce(mockArticle);
    
    await unfavoriteArticleController(req, res);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: req.user!.email },
    });
    expect(prisma.article.findFirst).toHaveBeenCalledWith({
      include: {
        user: true,
        comments: undefined,
      },
      where: { slug: { equals: req.params.slug } },
    });
    expect(prisma.article.update).toHaveBeenCalledWith({
      where: { id: mockArticle.id },
      data: {
        favoritedUserIdList: updatedFavoritedUserIdList,
        updatedAt: updatedAtDateObject,
      },
      include: { user: true },
    });
    expect(res.send).toHaveBeenCalledWith({
      article: updatedArticle,
    });
  });

  test('should not update an article if it is not liked', async () => {
    prisma.article.findFirst.mockResolvedValueOnce(updatedArticle);
    
    await unfavoriteArticleController(req, res);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: req.user!.email },
    });
    expect(prisma.article.findFirst).toHaveBeenCalledWith({
      include: {
        user: true,
        comments: undefined,
      },
      where: { slug: { equals: req.params.slug } },
    });
    expect(res.send).toHaveBeenCalledWith({
      article: updatedArticle,
    });
    expect(prisma.article.update).not.toHaveBeenCalled();
  });

  test('should return NOT_FOUND when article does not exist', async () => {
    prisma.article.findFirst.mockResolvedValueOnce(null);

    await unfavoriteArticleController(req, res);

    expect(res.status).toHaveBeenCalledWith(NOT_FOUND.code);
    expect(res.send).toHaveBeenCalledWith({
      error: NOT_FOUND.message,
      details: 'This article does not exist.',
    });
  });

  test('should handle INTERNAL_SERVER_ERROR', async () => {
    prisma.article.findFirst.mockRejectedValueOnce(new Error('Test error'));

    await unfavoriteArticleController(req, res);

    expect(res.status).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR.code);
    expect(res.send).toHaveBeenCalledWith({
      error: INTERNAL_SERVER_ERROR.message,
      details: JSON.stringify(new Error('Test error')),
    });
  });
});
