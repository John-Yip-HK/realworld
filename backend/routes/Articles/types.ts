import type { Article, User } from '@prisma/client';
import { type Profile } from '../Profile';
import { type ErrorResponse } from '../../globals';

interface ArticleObj extends Omit<Article, 'id' | 'userId' | 'user' | 'favoritedUserIdList'> {
  author: Profile;
  favorited: boolean;
  favoritesCount: number;
}

type MultipleArticlesResponse = {
  articles: ArticleObj[];
  articlesCount: number;
} | ErrorResponse;

type SingleArticleResponse = {
  article: ArticleObj;
} | ErrorResponse;

type DeleteArticleResponse = void | ErrorResponse;

interface GetArticlesQueryParams {
  tag?: string;
  author?: string;
  favorited?: string;
  offset?: number;
  limit?: number;
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
}
