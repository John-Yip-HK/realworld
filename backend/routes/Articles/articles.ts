import { Router, type RequestHandler } from 'express';

import { 
  commentArticle,
  deleteArticle, 
  deleteComment, 
  favoriteArticle, 
  getArticle, 
  unfavoriteArticle, 
  updateArticle 
} from '../../dao/articlesDao';
import { getUserByEmail } from '../../dao/usersDao';
import getJwtUserDetailsMiddleware, { type RequestWithCurrentUserEmail } from '../../middlewares/getJwtUserDetailsMiddleware';
import jwtPassportMiddleware from '../../middlewares/jwtPassportMiddleware';
import { checkAuthMiddleware } from '../../middlewares/checkAuthMiddleware';
import { 
  createArticleCommentController,
  createArticleController, 
  deleteArticleCommentController, 
  deleteArticleController, 
  getArticleCommentsController, 
  getArticlesController, 
  getArticlesFeedController, 
  getSingleArticleController, 
  updateArticleController
} from '../../controllers/articles/articlesController';
import * as articlesUtils from '../../controllers/articles/utils';

import statusCodes from '../../constants/status-codes';

import type {
  GetArticlesFeedQueryParams,
  GetArticlesQueryParams,
  MultipleArticlesResponse,
  SingleArticleResponse,
  CreateArticleBody,
  ArticlePathParams,
  UpdateArticleBody,
  DeleteArticleResponse,
  RawArticlePathParams,
  MultipleCommentsResponse,
  SingleCommentResponse,
  AddCommentBody
} from './types';
import type { ResponseObj } from '../../globals';

const { parseRawArticles, parseRawComments } = articlesUtils;

const { 
  INTERNAL_SERVER_ERROR, 
  NOT_FOUND, 
  BAD_REQUEST, 
  FORBIDDEN, 
  NO_CONTENT,
  UNPROCESSABLE_ENTITY,
} = statusCodes;

const articlesRouter = Router();

interface CommentIdPathParam {
  commentId: string;
}

const checkSlugPresenceMiddleware: RequestHandler<RawArticlePathParams, any, any, any> = (req, res, next) => {
  if (!req.params.slug) {
    return res.status(BAD_REQUEST.code).send({
      error: BAD_REQUEST.message,
      details: 'No article slug.',
    });
  }

  next();
}

const checkArticleCommentIdPresenceMiddleware: RequestHandler<Partial<CommentIdPathParam>, any, any, any> = (req, res, next) => {
  const { commentId } = req.params;
  
  if (!req.params.commentId) {
    return res.status(BAD_REQUEST.code).send({
      error: BAD_REQUEST.message,
      details: 'No article comment ID.',
    });
  }

  if (Number.isNaN(+commentId!)) {
    return res.status(UNPROCESSABLE_ENTITY.code).send({
      errors: {
        details: ['Comment ID is not a number.'],
      },
    });
  }

  next();
}

async function getCurrentUser(currentUserEmail?: string) {
  return currentUserEmail ? 
    getUserByEmail(currentUserEmail) :
    Promise.resolve(null);
}

articlesRouter.get<void, MultipleArticlesResponse, void, GetArticlesQueryParams>(
  '/',
  getJwtUserDetailsMiddleware,
  getArticlesController
);

articlesRouter.get<void, MultipleArticlesResponse, void, GetArticlesFeedQueryParams>(
  '/feed', 
  jwtPassportMiddleware,
  checkAuthMiddleware,
  getArticlesFeedController
);

articlesRouter.post<void, SingleArticleResponse, CreateArticleBody, void>(
  '/',
  jwtPassportMiddleware,
  checkAuthMiddleware,
  createArticleController
);

articlesRouter.get<ArticlePathParams, SingleArticleResponse, void, void>(
  '/:slug', 
  getJwtUserDetailsMiddleware,
  checkSlugPresenceMiddleware,
  getSingleArticleController
);

articlesRouter.put<ArticlePathParams, SingleArticleResponse, UpdateArticleBody, void>(
  '/:slug',
  jwtPassportMiddleware,
  checkAuthMiddleware,
  checkSlugPresenceMiddleware,
  updateArticleController
);

articlesRouter.delete<ArticlePathParams, DeleteArticleResponse, void, void>(
  '/:slug',
  jwtPassportMiddleware,
  checkAuthMiddleware,
  checkSlugPresenceMiddleware,
  deleteArticleController
);

articlesRouter.get<ArticlePathParams, MultipleCommentsResponse, void, void>(
  '/:slug/comments',
  checkSlugPresenceMiddleware,
  getJwtUserDetailsMiddleware,
  getArticleCommentsController
);

articlesRouter.post<ArticlePathParams, SingleCommentResponse, AddCommentBody, void>(
  '/:slug/comments',
  jwtPassportMiddleware,
  checkAuthMiddleware,
  checkSlugPresenceMiddleware,
  createArticleCommentController
);

articlesRouter.delete<ArticlePathParams & CommentIdPathParam, ResponseObj<void>, void, void>(
  '/:slug/comments/:commentId',
  jwtPassportMiddleware,
  checkAuthMiddleware,
  checkSlugPresenceMiddleware,
  checkArticleCommentIdPresenceMiddleware,
  deleteArticleCommentController
);

articlesRouter.post<ArticlePathParams, SingleArticleResponse, void>(
  '/:slug/favorite',
  jwtPassportMiddleware,
  checkAuthMiddleware,
  checkSlugPresenceMiddleware,
  async (req, res) => {
    try {
      const { slug } = req.params;
      const { email } = req.user!;

      const currentUser = (await getCurrentUser(email))!;
      const { id: currentUserId } = currentUser;
      const articleWithSlugParam = await getArticle({ slug });

      if (!articleWithSlugParam) {
        return res.status(NOT_FOUND.code).send({
          error: NOT_FOUND.message,
          details: 'This article does not exist.',
        });
      }

      if (articleWithSlugParam.favoritedUserIdList.includes(currentUserId)) {
        const processedArticle = parseRawArticles([articleWithSlugParam], currentUser)[0];
        
        return res.send({ article: processedArticle });
      }

      const likedArticle = await favoriteArticle({
        articleId: articleWithSlugParam.id,
        oldFavoritedUsersList: articleWithSlugParam.favoritedUserIdList,
        userId: currentUserId,
      });

      const processedArticle = parseRawArticles([likedArticle], currentUser)[0];
      
      return res.send({ article: processedArticle });
    } catch (error) {
      return res.status(INTERNAL_SERVER_ERROR.code).send({
        error: INTERNAL_SERVER_ERROR.message,
        details: JSON.stringify(error),
      });
    }
  }  
);

articlesRouter.delete<ArticlePathParams, SingleArticleResponse, void>(
  '/:slug/favorite',
  jwtPassportMiddleware,
  checkAuthMiddleware,
  checkSlugPresenceMiddleware,
  async (req, res) => {
    try {
      const { slug } = req.params;
      const { email } = req.user!;

      const currentUser = (await getCurrentUser(email))!;
      const { id: currentUserId } = currentUser;
      const articleWithSlugParam = await getArticle({ slug });

      if (!articleWithSlugParam) {
        return res.status(NOT_FOUND.code).send({
          error: NOT_FOUND.message,
          details: 'This article does not exist.',
        });
      }

      if (!articleWithSlugParam.favoritedUserIdList.includes(currentUserId)) {
        const processedArticle = parseRawArticles([articleWithSlugParam], currentUser)[0];
        
        return res.send({ article: processedArticle });
      }

      const dislikedArticle = await unfavoriteArticle({
        articleId: articleWithSlugParam.id,
        oldFavoritedUsersList: articleWithSlugParam.favoritedUserIdList,
        userId: currentUserId,
      });

      const processedArticle = parseRawArticles([dislikedArticle], currentUser)[0];
      
      return res.send({ article: processedArticle });
    } catch (error) {
      return res.status(INTERNAL_SERVER_ERROR.code).send({
        error: INTERNAL_SERVER_ERROR.message,
        details: JSON.stringify(error),
      });
    }
  }  
);

export { articlesRouter };
