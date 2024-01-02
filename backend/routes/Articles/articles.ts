import { Router } from 'express';
import type { User as PrismaUser } from '@prisma/client';

import { createArticle, deleteArticle, getArticle, getArticles, getArticlesFeed, updateArticle } from '../../dao/articlesDao';
import statusCodes from '../../constants/status-codes';
import getJwtUserDetailsMiddleware, { type RequestWithCurrentUserEmail } from '../../middlewares/getJwtUserDetailsMiddleware';

import {
  GetArticlesFeedQueryParams,
  type ArticleObj,
  type GetArticlesQueryParams,
  type MultipleArticlesResponse,
  SingleArticleResponse,
  CreateArticleBody,
  ArticlePathParams,
  UpdateArticleBody,
  DeleteArticleResponse
} from '.';
import { handleProfileResponse } from '../../utils/handleUserResponseUtils';
import { getUserByEmail } from '../../dao/usersDao';
import jwtPassportMiddleware from '../../middlewares/jwtPassportMiddleware';
import { checkAuthMiddleware } from '../../middlewares/checkAuthMiddleware';

const { INTERNAL_SERVER_ERROR, NOT_FOUND, BAD_REQUEST, FORBIDDEN, NO_CONTENT } = statusCodes;

const articlesRouter = Router();

function parseRawArticles(
  rawArticles: ReturnType<typeof getArticles> extends Promise<infer U> ? U : never,
  currentUser?: Pick<PrismaUser, 'id' | 'email' | 'followedUsers'> | null,
) {
  const currentUserId = currentUser?.id;
  const currentUserEmail = currentUser?.email;
  const followedUsersOfCurrentUser = new Set(currentUser?.followedUsers ?? []);
  
  return rawArticles.map<ArticleObj>(article => {
    const {
      userId,
      user: articleAuthor,
      favoritedUserIdList,
      ...otherAttributes
    }= article;
    const isFollowingArticleAuthor = 
      currentUserEmail !== articleAuthor.email &&
      followedUsersOfCurrentUser.has(userId);
    const favorited = favoritedUserIdList.includes(currentUserId ?? -1);
    
    return {
      ...otherAttributes,
      favoritesCount: favoritedUserIdList.length,
      favorited,
      author: handleProfileResponse(articleAuthor, isFollowingArticleAuthor).profile,
    };
  });
}

async function getCurrentUser(currentUserEmail?: string) {
  return currentUserEmail ? 
    getUserByEmail(currentUserEmail) :
    Promise.resolve(null);
}

articlesRouter.get<void, MultipleArticlesResponse, void, GetArticlesQueryParams>(
  '/',
  getJwtUserDetailsMiddleware,
  async (
    req: RequestWithCurrentUserEmail<void, MultipleArticlesResponse, void, GetArticlesQueryParams>, 
    res
  ) => {
    try {
      const { currentUserEmail, query } = req;
      const currentUser = await getCurrentUser(currentUserEmail);
      const rawArticles = await getArticles(query);
      const articles = parseRawArticles(rawArticles, currentUser);
      
      return res.send({
        articles: articles,
        articlesCount: articles.length,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'The favorited user does not exist.') {
          return res.status(NOT_FOUND.code).send({
            error: NOT_FOUND.message,
            details: error.message,
          });
        } 

        return res.status(BAD_REQUEST.code).send({
          error: BAD_REQUEST.message,
          details: JSON.stringify(error),
        });
      }
      
      return res.status(INTERNAL_SERVER_ERROR.code).send({
        error: INTERNAL_SERVER_ERROR.message,
        details: JSON.stringify(error),
      });
    }
  }
);

articlesRouter.get<void, MultipleArticlesResponse, void, GetArticlesFeedQueryParams>(
  '/feed', 
  jwtPassportMiddleware,
  checkAuthMiddleware,
  async (req, res) => {
    const { query } = req;

    try {
      const currentUser = await getCurrentUser(req.user!.email);
      const { followedUsers } = currentUser!;
      const resultRawArticles = await getArticlesFeed({
        ...query,
        followedUsers,
      });
      const articles = parseRawArticles(resultRawArticles, currentUser);
      
      return res.send({
        articles,
        articlesCount: followedUsers.length,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(BAD_REQUEST.code).send({
          error: BAD_REQUEST.message,
          details: JSON.stringify(error),
        });
      }
      
      return res.status(INTERNAL_SERVER_ERROR.code).send({
        error: INTERNAL_SERVER_ERROR.message,
        details: JSON.stringify(error),
      });
    }
  }
);

articlesRouter.post<void, SingleArticleResponse, CreateArticleBody, void>(
  '/',
  jwtPassportMiddleware,
  checkAuthMiddleware,
  async (req, res) => {
    try {
      const currentUser = await getCurrentUser(req.user!.email);
      const { id: userId } = currentUser!;

      const articleWithTheSameTitle = await getArticle({ title: req.body.article.title, });

      if (articleWithTheSameTitle) {
        return res.status(BAD_REQUEST.code).send({
          error: BAD_REQUEST.message,
          details: 'Article with the same title already exists.',
        });
      }
      
      const createArticleParams = {
        ...req.body.article,
        userId,
      };
      const createdRawArticle = await createArticle(createArticleParams);
      const createdArticle = parseRawArticles([createdRawArticle], currentUser)[0];

      return res.send({
        article: createdArticle,
      });
    } catch (error) {
      return res.status(INTERNAL_SERVER_ERROR.code).send({
        error: INTERNAL_SERVER_ERROR.message,
        details: JSON.stringify(error),
      });
    }
  }
);

articlesRouter.get<ArticlePathParams, SingleArticleResponse, void, void>(
  '/:slug', 
  getJwtUserDetailsMiddleware, 
  async (
    req: RequestWithCurrentUserEmail<ArticlePathParams, SingleArticleResponse, void, void>, 
    res
  ) => {
    const { currentUserEmail, params: { slug } } = req;
    
    if (!slug) {
      return res.status(BAD_REQUEST.code).send({
        error: BAD_REQUEST.message,
        details: 'No article slug found.',
      });
    }

    try {      
      const currentUser = await getCurrentUser(currentUserEmail);
      const rawArticle = await getArticle({ slug });

      if (!rawArticle) {
        return res.status(NOT_FOUND.code).send({
          error: NOT_FOUND.message,
          details: 'Such article does not exist.',
        });
      }

      const article = parseRawArticles([rawArticle], currentUser)[0];

      return res.send({
        article,
      });
    } catch (error) {
      return res.status(INTERNAL_SERVER_ERROR.code).send({
        error: INTERNAL_SERVER_ERROR.message,
        details: JSON.stringify(error),
      });
    }
  }
);

articlesRouter.put<ArticlePathParams, SingleArticleResponse, UpdateArticleBody, void>(
  '/:slug',
  jwtPassportMiddleware,
  checkAuthMiddleware,
  async (req, res) => {
    const { slug } = req.params;

    if (!slug) {
      return res.status(BAD_REQUEST.code).send({
        error: BAD_REQUEST.message,
        details: 'No article slug found.',
      });
    }
    
    try {
      const currentUser = await getCurrentUser(req.user!.email);
      const { id: userId } = currentUser!;
      const articleWithTheSameTitle = await getArticle({ slug });

      if (!articleWithTheSameTitle) {
        return res.status(NOT_FOUND.code).send({
          error: NOT_FOUND.message,
          details: 'This article does not exist.',
        });
      }
      
      if (articleWithTheSameTitle.userId !== userId) {
        return res.status(FORBIDDEN.code).send({
          error: FORBIDDEN.message,
          details: 'This article does not belong to the current user.',
        });
      }
      
      const updateArticleParams = {
        ...req.body.article,
        userId,
        articleId: articleWithTheSameTitle.id,
        oldTitle: articleWithTheSameTitle.title,
      };
      const updatedRawArticle = await updateArticle(updateArticleParams);
      const updatedArticle = parseRawArticles([updatedRawArticle], currentUser)[0];

      return res.send({
        article: updatedArticle,
      });
    } catch (error) {
      return res.status(INTERNAL_SERVER_ERROR.code).send({
        error: INTERNAL_SERVER_ERROR.message,
        details: JSON.stringify(error),
      });
    }
  }
);

articlesRouter.delete<ArticlePathParams, DeleteArticleResponse, void, void>(
  '/:slug',
  jwtPassportMiddleware,
  checkAuthMiddleware,
  async (req, res) => {
    const { slug } = req.params;

    if (!slug) {
      return res.status(BAD_REQUEST.code).send({
        error: BAD_REQUEST.message,
        details: 'No article slug found.',
      });
    }
    
    try {
      const currentUser = await getCurrentUser(req.user!.email);
      const { id: userId } = currentUser!;
      const articleWithTheSameTitle = await getArticle({ slug });

      if (!articleWithTheSameTitle) {
        return res.status(NOT_FOUND.code).send({
          error: NOT_FOUND.message,
          details: 'This article does not exist.',
        });
      }
      
      if (articleWithTheSameTitle.userId !== userId) {
        return res.status(FORBIDDEN.code).send({
          error: FORBIDDEN.message,
          details: 'This article does not belong to the current user.',
        });
      }
      
      const deleteArticleParams = {
        articleId: articleWithTheSameTitle.id,
        slug,
      };
      await deleteArticle(deleteArticleParams);

      return res.sendStatus(NO_CONTENT.code);
    } catch (error) {
      return res.status(INTERNAL_SERVER_ERROR.code).send({
        error: INTERNAL_SERVER_ERROR.message,
        details: JSON.stringify(error),
      });
    }
  }
);

export { articlesRouter };
