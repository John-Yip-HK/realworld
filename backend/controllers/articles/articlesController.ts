import type { Request, Response } from 'express';

import { commentArticle, createArticle, deleteArticle, deleteComment, getArticle, getArticles, getArticlesFeed, updateArticle } from '../../dao/articlesDao';
import { getCurrentUser, parseRawArticles, parseRawComments } from './utils';

import statusCodes from '../../constants/status-codes';

import { type RequestWithCurrentUserEmail } from '../../middlewares/getJwtUserDetailsMiddleware';
import type { 
  MultipleArticlesResponse, 
  GetArticlesQueryParams, 
  SingleArticleResponse, 
  CreateArticleBody, 
  GetArticlesFeedQueryParams, 
  ArticlePathParams,
  UpdateArticleBody,
  DeleteArticleResponse,
  MultipleCommentsResponse,
  AddCommentBody,
  SingleCommentResponse,
  CommentIdPathParam
} from '../../routes/Articles';
import { ResponseObj } from '../../globals';

const {
  NOT_FOUND,
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  FORBIDDEN,
  NO_CONTENT
} = statusCodes;

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

export async function updateArticleController(
  req: Request<ArticlePathParams, SingleArticleResponse, UpdateArticleBody, void>,
  res: Response<SingleArticleResponse>
) {
  const { slug } = req.params;
  
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

export async function deleteArticleController(
  req: Request<ArticlePathParams, DeleteArticleResponse, void, void>,
  res: Response<DeleteArticleResponse>
) {
  const { slug } = req.params;
  
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

export async function getArticleCommentsController(
  req: RequestWithCurrentUserEmail<ArticlePathParams, MultipleCommentsResponse, void, void>, 
  res: Response<MultipleCommentsResponse>
) {
  const { slug } = req.params;
  const { currentUserEmail } = req;

  try {
    const currentUser = await getCurrentUser(currentUserEmail);
    const articleWithComments = await getArticle({
      slug,
      includeComments: true,
    });

    if (!articleWithComments) {
      return res.status(NOT_FOUND.code).send({
        error: NOT_FOUND.message,
        details: 'Such article does not exist.',
      });
    }

    const parsedComments = parseRawComments(articleWithComments.comments, articleWithComments.user, currentUser);

    return res.send({
      comments: parsedComments,
    });
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR.code).send({
      error: INTERNAL_SERVER_ERROR.message,
      details: JSON.stringify(error),
    });
  }
}

export async function createArticleCommentController(
  req: Request<ArticlePathParams, SingleCommentResponse, AddCommentBody, void>,
  res: Response<SingleCommentResponse>
) {
  const { slug } = req.params;
  const { email: currentUserEmail } = req.user!;
  const { comment: { body: commentBody } } = req.body;

  try {
    const currentUser = (await getCurrentUser(currentUserEmail))!;
    const articleToComment = await getArticle({ slug });

    if (!articleToComment) {
      return res.status(NOT_FOUND.code).send({
        error: NOT_FOUND.message,
        details: 'Such article does not exist.',
      });
    }

    const postedComment = await commentArticle({
      body: commentBody,
      articleId: articleToComment.id,
      userId: currentUser.id,
    });

    const parsedComment = parseRawComments(postedComment, currentUser)[0];

    return res.send({
      comment: parsedComment,
    });
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR.code).send({
      error: INTERNAL_SERVER_ERROR.message,
      details: JSON.stringify(error),
    });
  }
}

export async function deleteArticleCommentController(
  req: Request<ArticlePathParams & CommentIdPathParam, ResponseObj<void>, void, void>,
  res: Response<ResponseObj<void>>
) {
  const { slug, commentId: rawCommentId } = req.params;
  const { email: currentUserEmail } = req.user!;
  const commentId = +rawCommentId;

  try {
    const currentUser = (await getCurrentUser(currentUserEmail))!;
    const articleWithCommentToBeDeleted = await getArticle({ 
      slug, 
      includeComments: true, 
    });

    if (!articleWithCommentToBeDeleted) {
      return res.status(NOT_FOUND.code).send({
        error: NOT_FOUND.message,
        details: 'Such article does not exist.',
      });
    }

    const commentToBeDeleted = articleWithCommentToBeDeleted.comments.find(
      comment => comment.id === commentId
    );

    if (!commentToBeDeleted) {
      return res.status(NOT_FOUND.code).send({
        error: NOT_FOUND.message,
        details: 'Such comment does not exist.',
      });
    }
    
    if (commentToBeDeleted.userId !== currentUser.id) {
      return res.status(FORBIDDEN.code).send({
        error: FORBIDDEN.message,
        details: 'Cannot delete other user\'s comment.',
      });
    }

    await deleteComment(commentId);

    return res.sendStatus(204);
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR.code).send({
      error: INTERNAL_SERVER_ERROR.message,
      details: JSON.stringify(error),
    });
  }
}
