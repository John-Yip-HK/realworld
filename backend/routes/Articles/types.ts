import type { Article, User, Comment } from '@prisma/client';
import { type Profile } from '../Profile';
import type { ResponseObj } from '../../globals';

interface ArticleObj extends Omit<Article, 'id' | 'userId' | 'user' | 'favoritedUserIdList'> {
  author: Profile;
  favorited: boolean;
  favoritesCount: number;
}

type MultipleArticlesResponse = ResponseObj<{
  articles: ArticleObj[];
  articlesCount: number;
}>;

type SingleArticleResponse = ResponseObj<{
  article: ArticleObj;
}>;

type DeleteArticleResponse = ResponseObj<void>;

interface GetArticlesQueryParams {
  tag?: string;
  author?: string;
  favorited?: string;
  offset?: number;
  limit?: number;
}

interface GetArticleParams {
  slug?: string;
  title?: string;
  includeComments?: boolean;
}

interface ArticlePathParams {
  slug: string;
}

type RawArticlePathParams = Partial<ArticlePathParams>;

type GetArticlesFeedQueryParams = Pick<GetArticlesQueryParams, 'offset' | 'limit'> & {
  followedUsers?: User['followedUsers'];
}

interface CreateArticleBody {
  article: {
    title: string;
    description: string;
    body: string;
    tagList: string[];
  }
}

interface UpdateArticleBody {
  article: Partial<CreateArticleBody['article']>;
}

interface CommentObj extends Omit<Comment, 'userId' | 'articleId'> {
  author: Profile;
}

type MultipleCommentsResponse = ResponseObj<{
  comments: CommentObj[];
}>

type SingleCommentResponse = ResponseObj<{
  comment: CommentObj;
}>

interface AddCommentBody {
  comment: {
    body: string;
  }
}

export type {
  ArticleObj,
  MultipleArticlesResponse,
  GetArticlesQueryParams,
  GetArticlesFeedQueryParams,
  SingleArticleResponse,
  DeleteArticleResponse,
  CreateArticleBody,
  UpdateArticleBody,
  ArticlePathParams,
  RawArticlePathParams,
  MultipleCommentsResponse,
  GetArticleParams,
  SingleCommentResponse,
  AddCommentBody,
}
