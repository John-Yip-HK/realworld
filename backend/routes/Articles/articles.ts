import { Router } from 'express';

import { getArticles } from '../../dao/articlesDao';
import statusCodes from '../../constants/status-codes';
import getJwtUserDetailsMiddleware, { type RequestWithCurrentUserEmail } from '../../middlewares/getJwtUserDetailsMiddleware';

import {
  type ArticleObj,
  type GetArticlesQueryParams,
  type MultipleArticlesResponse
} from '.';
import { handleProfileResponse } from '../../utils/handleUserResponseUtils';
import { getUserByEmail } from '../../dao/usersDao';

const articlesRouter = Router();

const { INTERNAL_SERVER_ERROR, NOT_FOUND, BAD_REQUEST } = statusCodes;

articlesRouter.get<
  void, 
  MultipleArticlesResponse,
  void,
  GetArticlesQueryParams
>(
  '/',
  getJwtUserDetailsMiddleware,
  async (
  req: RequestWithCurrentUserEmail<
    void, 
    MultipleArticlesResponse, 
    void, 
    GetArticlesQueryParams
  >, 
  res) => {
  try {
    const { currentUserEmail, query } = req;
    const currentUser = await (
        currentUserEmail ? 
          getUserByEmail(currentUserEmail) :
          Promise.resolve(null)
      );
    const followedUsersOfCurrentUser: number[] = currentUser?.followedUsers ?? [];
    
    const rawArticles = await getArticles(query);
    const articles = rawArticles.map<ArticleObj>(article => {
      const { 
        userId,
        user: articleAuthor,
        ...otherAttributes
      }= article;
      const isFollowingArticleAuthor = 
        currentUserEmail !== articleAuthor.email &&
        followedUsersOfCurrentUser.includes(userId);
      
      return {
        ...otherAttributes,
        author: handleProfileResponse(articleAuthor, isFollowingArticleAuthor).profile,
      };
    });
    
    return res.send({
      articles: articles,
      articlesCount: articles.length,
    });
  } catch (error) {
    if (
      error instanceof Error
    ) {
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
});

export { articlesRouter };
