import type { Response } from 'express';
import type { User as PrismaUser } from '@prisma/client';

import { 
  getArticlesController, 
} from '../../controllers/articles';
import { 
  type RawArticles, 
  parseRawArticles 
} from '../../controllers/articles/utils';
import prisma from '../../prisma/__mocks__/client';

import statusCodes from '../../constants/status-codes';

import type { RequestWithCurrentUserEmail } from '../../middlewares/getJwtUserDetailsMiddleware';
import type { 
  MultipleArticlesResponse, 
  GetArticlesQueryParams, 
} from '../../routes/Articles';

const { NOT_FOUND, BAD_REQUEST, INTERNAL_SERVER_ERROR } = statusCodes;

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
