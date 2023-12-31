import { Router } from 'express';

import { getArticles } from '../../dao/articlesDao';
import statusCodes from '../../constants/status-codes';
import getCurrentUserEmailMiddleware, { type RequestWithCurrentUserEmail } from '../../middlewares/getCurrentUserEmailMiddleware';

import {
  type ArticleObj,
  type GetArticlesQueryParams,
  type MultipleArticlesResponse
} from '.';
import { handleProfileResponse } from '../../utils/handleUserResponseUtils';

const articlesRouter = Router();

const { INTERNAL_SERVER_ERROR } = statusCodes;

articlesRouter.get<
  void, 
  MultipleArticlesResponse,
  void,
  GetArticlesQueryParams
>(
  '/',
  getCurrentUserEmailMiddleware,
  async (req: RequestWithCurrentUserEmail, res) => {
  try {
    const articles = (await getArticles())
      .map<ArticleObj>(article => {
        const { 
          userId,
          user: articleAuthor,
          ...otherAttributes
        }= article;
        const { followedUsers } = articleAuthor;
        const isFollowingArticleAuthor = 
          req.currentUserEmail !== articleAuthor.email &&
          followedUsers.includes(req.currentUserId ?? -1);
        
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
    return res.status(INTERNAL_SERVER_ERROR.code).send({
      error: INTERNAL_SERVER_ERROR.message,
      details: JSON.stringify(error),
    });
  }
});

export { articlesRouter };
