import type { Request, Response } from 'express';

import { createArticle, getArticle, getArticles, getArticlesFeed } from '../../dao/articlesDao';
import { getCurrentUser, parseRawArticles } from './utils';

import statusCodes from '../../constants/status-codes';

import { type RequestWithCurrentUserEmail } from '../../middlewares/getJwtUserDetailsMiddleware';
import type { 
  MultipleArticlesResponse, 
  GetArticlesQueryParams, 
  SingleArticleResponse, 
  CreateArticleBody, 
  GetArticlesFeedQueryParams, 
  ArticlePathParams
} from '../../routes/Articles';

const { NOT_FOUND, BAD_REQUEST, INTERNAL_SERVER_ERROR } = statusCodes;

export async function getArticlesController(
  req: RequestWithCurrentUserEmail<void, MultipleArticlesResponse, void, GetArticlesQueryParams>, 
  res: Response<MultipleArticlesResponse>
) {
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

export async function getArticlesFeedController(
  req: Request<void, MultipleArticlesResponse, void, GetArticlesFeedQueryParams>,
  res: Response<MultipleArticlesResponse>
) {
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
      articlesCount: articles.length,
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

export async function createArticleController(
  req: Request<void, SingleArticleResponse, CreateArticleBody, void>,
  res: Response<SingleArticleResponse>
) {
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

export async function getSingleArticleController(
  req: RequestWithCurrentUserEmail<ArticlePathParams, SingleArticleResponse, void, void>, 
  res: Response<SingleArticleResponse>
) {
  const { currentUserEmail, params: { slug } } = req;

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
