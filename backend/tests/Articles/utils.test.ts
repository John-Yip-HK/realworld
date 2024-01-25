import type { 
  User as PrismaUser, 
  Comment as PrismaComment,
} from '@prisma/client';

import { 
  RawArticles,
  getArticleAuthorFollowStates, 
  getCurrentUser, 
  parseRawArticles, 
  parseRawComments
} from '../../controllers/articles/utils';
import prisma from '../../prisma/__mocks__/client';

describe('getCurrentUser', () => {
  it('should return the current user when the user exists', async () => {
    const user: PrismaUser = {
      id: 1,
      email: 'test@test.com',
      username: 'test',
      hashedPassword: 'hashedPassword',
      bio: 'bio',
      image: 'image',
      followedUsers: [2],
    };

    prisma.user.findUnique.mockResolvedValue(user);

    const result = await getCurrentUser('test@test.com');

    expect(result).toEqual(user);
  });

  it('should return null when the user does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const result = await getCurrentUser('test@test.com');
    
    expect(result).toBeNull();
  });

  it('should return null when email is not provided', async () => {
    expect(await getCurrentUser()).toBeNull();
  });
});

describe('getArticleAuthorFollowStates', () => {
  let currentUser: PrismaUser;
  let dummyArticleAuthorDetails: Pick<PrismaUser, 'email' | 'id'>;

  beforeEach(() => {
    currentUser = {
      id: 1,
      email: 'test@test.com',
      username: 'test',
      hashedPassword: 'hashedPassword',
      bio: 'bio',
      image: 'image',
      followedUsers: [2],
    };
    dummyArticleAuthorDetails = {
      email: 'dummy@example.com',
      id: 2,
    };
  });

  it('`isFollowingArticleAuthor` should be true when the current user follows the author', async () => {
    const result = getArticleAuthorFollowStates(dummyArticleAuthorDetails, currentUser);

    expect(result.isFollowingArticleAuthor).toBe(true);
  });

  it('`isFollowingArticleAuthor` should be false when the current user does not follow the author', async () => {
    currentUser.followedUsers = [3];

    const result = getArticleAuthorFollowStates(dummyArticleAuthorDetails, currentUser);

    expect(result.isFollowingArticleAuthor).toBe(false);
  });

  it('`isFollowingArticleAuthor` should be false when no current user argument is provided', () => {
    const result = getArticleAuthorFollowStates(dummyArticleAuthorDetails);

    expect(result.isFollowingArticleAuthor).toBe(false);
  });

  it('`isFollowingArticleAuthor` should be false when article author is the current user', () => {
    dummyArticleAuthorDetails.email = currentUser.email;
    
    const result = getArticleAuthorFollowStates(dummyArticleAuthorDetails, currentUser);

    expect(result.isFollowingArticleAuthor).toBe(false);
  });
});

describe('parseRawComments', () => {
  let dummyUser: PrismaUser;
  let dummyArticleAuthor: PrismaUser;
  let rawComments: PrismaComment[];

  beforeEach(() => {
    rawComments = [
      {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        body: 'Test comment',
        userId: 1,
        articleId: 1,
      },
    ];

    dummyArticleAuthor = {
      id: 1,
      username: 'dummy',
      email: 'dummyTwo@example.com',
      hashedPassword: 'hashedPassword',
      bio: 'bio',
      image: 'image',
      followedUsers: [],
    };

    dummyUser = {
      id: 2,
      email: 'dummy@example.com',
      username: 'dummy',
      hashedPassword: 'hashedPassword',
      bio: 'bio',
      image: 'image',
      followedUsers: [],
    };
  });

  it('should parse raw comments array into the correct format', () => {
    const result = parseRawComments(rawComments, dummyArticleAuthor, dummyUser);
    
    expect(result).toEqual([
      {
        id: rawComments[0].id,
        createdAt: rawComments[0].createdAt,
        updatedAt: rawComments[0].updatedAt,
        body: rawComments[0].body,
        author: {
          username: dummyUser.username,
          bio: dummyUser.bio,
          image: dummyUser.image,
          following: false,
        },
      },
    ]);
  });

  it('should parse raw comment object into the correct format', () => {
    const result = parseRawComments(rawComments[0], dummyArticleAuthor, dummyUser);
    
    expect(result).toEqual([
      {
        id: rawComments[0].id,
        createdAt: rawComments[0].createdAt,
        updatedAt: rawComments[0].updatedAt,
        body: rawComments[0].body,
        author: {
          username: dummyUser.username,
          bio: dummyUser.bio,
          image: dummyUser.image,
          following: false,
        },
      },
    ]);
  });

  it('`author.following` of a comment object should be true if the user is following the article author', () => {
    dummyUser.followedUsers = [dummyArticleAuthor.id];
    
    const result = parseRawComments(rawComments, dummyArticleAuthor, dummyUser);
    
    expect(result[0].author.following).toEqual(true);
  });

  it('`author.following` of a comment object should be false if no current user is provided', () => {
    dummyUser.followedUsers = [dummyArticleAuthor.id];
    
    const result = parseRawComments(rawComments, dummyArticleAuthor);
    
    expect(result[0].author.following).toEqual(false);
  });

  it('`author.following` of a comment object should be false if article author is the current user', () => {
    dummyArticleAuthor.email = dummyUser.email;
    
    const result = parseRawComments(rawComments, dummyArticleAuthor, dummyUser);
    
    expect(result[0].author.following).toEqual(false);
  });
});

describe('parseRawArticles', () => {
  let dummyUser: PrismaUser;
  let dummyArticleAuthor: PrismaUser;
  let rawArticles: RawArticles;

  beforeEach(() => {
    dummyArticleAuthor = {
      id: 1,
      username: 'dummy',
      email: 'dummyTwo@example.com',
      hashedPassword: 'hashedPassword',
      bio: 'bio',
      image: 'image',
      followedUsers: [],
    };
    
    rawArticles = [
      {
        id: 1,
        slug: 'test-article',
        title: 'Test Article',
        description: 'This is a test article',
        body: 'Test article body',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 1,
        favoritedUserIdList: [],
        tagList: [],
        user: dummyArticleAuthor,
      },
    ];

    dummyUser = {
      id: 2,
      email: 'dummy@example.com',
      username: 'dummy',
      hashedPassword: 'hashedPassword',
      bio: 'bio',
      image: 'image',
      followedUsers: [],
    };
  });

  it('should parse raw articles array into the correct format', () => {
    const result = parseRawArticles(rawArticles, dummyUser);
    
    expect(result).toEqual([
      {
        id: rawArticles[0].id,
        slug: rawArticles[0].slug,
        title: rawArticles[0].title,
        description: rawArticles[0].description,
        body: rawArticles[0].body,
        createdAt: rawArticles[0].createdAt,
        updatedAt: rawArticles[0].updatedAt,
        author: {
          username: dummyUser.username,
          bio: dummyUser.bio,
          image: dummyUser.image,
          following: false,
        },
        favorited: false,
        favoritesCount: 0,
        tagList: [],
      },
    ]);
  });

  it('`favorited` and `favoritesCount` should be true and 1 respectively if current user has favorited the article', () => {
    rawArticles[0].favoritedUserIdList.push(dummyUser.id);
    
    const result = parseRawArticles(rawArticles, dummyUser);
    
    expect(result[0].favorited).toEqual(true);
    expect(result[0].favoritesCount).toEqual(1);
  });

  it('`favorited` and `favoritesCount` should be false and 0 respectively if no current user is provided', () => {
    const result = parseRawArticles(rawArticles);
    
    expect(result[0].favorited).toEqual(false);
    expect(result[0].favoritesCount).toEqual(0);
  });

  it('`author.following` of an article object should be true if current user is following the article author', () => {
    dummyUser.followedUsers.push(dummyArticleAuthor.id);
    
    const result = parseRawArticles(rawArticles, dummyUser);
    
    expect(result[0].author.following).toEqual(true);
  });
});
