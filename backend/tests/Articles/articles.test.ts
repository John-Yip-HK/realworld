import type { Mock } from 'vitest';
import type { Request, Response } from 'express';
import type { User as PrismaUser } from '@prisma/client';

import { 
  getArticlesController, 
  getArticlesFeedController 
} from '../../controllers/articles';
import { 
  type RawArticles, 
  getCurrentUser, 
  parseRawArticles 
} from '../../controllers/articles/utils';
import { 
  getArticles, 
  getArticlesFeed 
} from '../../dao/articlesDao';

import statusCodes from '../../constants/status-codes';

import type { RequestWithCurrentUserEmail } from '../../middlewares/getJwtUserDetailsMiddleware';
import type { 
  MultipleArticlesResponse, 
  GetArticlesQueryParams, 
  GetArticlesFeedQueryParams 
} from '../../routes/Articles';

const { NOT_FOUND, BAD_REQUEST, INTERNAL_SERVER_ERROR } = statusCodes;

vi.mock('../../controllers/articles/utils', async (importOriginal) => {
  const originalImports = await importOriginal<object>();

  return {
    ...originalImports,
    getCurrentUser: vi.fn(),
  };
});
vi.mock('../../controllers/articlesController');
vi.mock('../../dao/articlesDao');

describe('getArticlesController', () => {
  let req: RequestWithCurrentUserEmail<void, MultipleArticlesResponse, void, GetArticlesQueryParams>;
  let res: Response<MultipleArticlesResponse>;
  let currentUser: PrismaUser;
  
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
  });

  it('should return the articles and the count of articles', async () => {
    const rawArticles: RawArticles = [
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
    
    (getCurrentUser as Mock).mockResolvedValueOnce(currentUser);
    (getArticles as Mock).mockResolvedValueOnce(rawArticles);

    await getArticlesController(req, res);

    expect(res.send).toHaveBeenCalledOnce();
    expect(res.send).toHaveBeenCalledWith({
      articles,
      articlesCount: articles.length,
    });
  });

  it('should return the articles and the count of articles with the first article having a following author', async () => {
    const copiedCurrentUser = structuredClone(currentUser);
    const anotherUser = {
      id: 2,
      email: 'test2@test.com', 
      followedUsers: [],
    } as unknown as PrismaUser;

    copiedCurrentUser.followedUsers = [anotherUser.id];

    const rawArticles: RawArticles = [
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
        userId: copiedCurrentUser.id,
        user: copiedCurrentUser,
      }
    ];
    const articles = parseRawArticles(rawArticles, copiedCurrentUser);
    
    (getCurrentUser as Mock).mockResolvedValueOnce(copiedCurrentUser);
    (getArticles as Mock).mockResolvedValueOnce(rawArticles);

    await getArticlesController(req, res);

    expect(res.send).toHaveBeenCalledOnce();
    expect(res.send).toHaveBeenCalledWith({
      articles,
      articlesCount: articles.length,
    });
    expect(articles[0].author.following).toBeTruthy();
  });

  it('should return the articles and the count of articles with favorited first article', async () => {
    const copiedCurrentUser = structuredClone(currentUser);
    const anotherUser = {
      id: 2,
      email: 'test2@test.com', 
      followedUsers: [],
    } as unknown as PrismaUser;

    const rawArticles: RawArticles = [
      { 
        id: 1,
        slug: 'test-2',
        title: 'test 2', 
        description: 'test two', 
        body: 'another test article', 
        tagList: [], 
        createdAt: new Date(), 
        updatedAt: new Date(), 
        favoritedUserIdList: [copiedCurrentUser.id],
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
        userId: copiedCurrentUser.id,
        user: copiedCurrentUser,
      }
    ];
    const articles = parseRawArticles(rawArticles, copiedCurrentUser);
    
    (getCurrentUser as Mock).mockResolvedValueOnce(copiedCurrentUser);
    (getArticles as Mock).mockResolvedValueOnce(rawArticles);

    await getArticlesController(req, res);

    expect(res.send).toHaveBeenCalledOnce();
    expect(res.send).toHaveBeenCalledWith({
      articles,
      articlesCount: articles.length,
    });
    expect(articles[0].favorited).toBeTruthy();
    expect(articles[0].favoritesCount).toBe(1);
  });

  it('should return NOT_FOUND if the favorited user does not exist', async () => {
    const copiedReq = structuredClone(req);
    const error = new Error('The favorited user does not exist.');

    copiedReq.query = { favorited: 'other-user' };

    (getCurrentUser as Mock).mockResolvedValueOnce(currentUser);
    (getArticles as Mock).mockRejectedValueOnce(error);

    await getArticlesController(copiedReq, res);

    expect(getArticles).toHaveBeenCalledOnce();
    expect(getArticles).toHaveBeenCalledWith(copiedReq.query);

    expect(res.status).toHaveBeenCalledWith(NOT_FOUND.code);
    expect(res.send).toHaveBeenCalledWith({
      error: NOT_FOUND.message,
      details: error.message,
    });
  });

  it('should return BAD_REQUEST for other errors with Error type', async () => {
    const error = new Error('Some other error.');

    (getCurrentUser as Mock).mockRejectedValueOnce(error);

    await getArticlesController(req, res);

    expect(res.status).toHaveBeenCalledWith(BAD_REQUEST.code);
    expect(res.send).toHaveBeenCalledWith({
      error: BAD_REQUEST.message,
      details: JSON.stringify(error),
    });
  });

  it('should return INTERNAL_SERVER_ERROR for other errors', async () => {
    const error = 'Non-Error error';

    (getCurrentUser as Mock).mockRejectedValueOnce(error);

    await getArticlesController(req, res);

    expect(res.status).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR.code);
    expect(res.send).toHaveBeenCalledWith({
      error: INTERNAL_SERVER_ERROR.message,
      details: JSON.stringify(error),
    });
  });
});

// describe('getArticlesFeedController', () => {
//   const reqFeed = {
//     user: {
//       email: 'test@test.com',
//     },
//     query: {},
//   } as unknown as Request<void, MultipleArticlesResponse, void, GetArticlesFeedQueryParams>;

//   it('should return the articles feed and the count of followed users', async () => {
//     const currentUser = { email: 'test@test.com', username: 'test', followedUsers: ['1'] };
//     const rawArticles = [{ id: '1', title: 'test', description: 'test', body: 'test', tagList: [], createdAt: new Date(), updatedAt: new Date(), favorited: false, favoritesCount: 0, author: currentUser }];
//     const articles = parseRawArticles(rawArticles, currentUser);
//     (getCurrentUser as Mock).mockResolvedValueOnce(currentUser);
//     (getArticlesFeed as Mock).mockResolvedValueOnce(rawArticles);
//     (parseRawArticles as Mock).mockReturnValueOnce(articles);
//     await getArticlesFeedController(reqFeed, res);
//     expect(res.send).toHaveBeenCalledWith({
//       articles,
//       articlesCount: currentUser.followedUsers.length,
//     });
//   });

//   // Add more tests for getArticlesFeedController here...
// });