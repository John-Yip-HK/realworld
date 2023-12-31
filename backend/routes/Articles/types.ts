import type { Article } from '@prisma/client';
import { Profile } from '../Profile';
import { ErrorResponse } from '../../globals';

interface ArticleObj extends Omit<Article, 'id' | 'userId' | 'user'> {
  author: Profile;
}

type MultipleArticlesResponse = {
  articles: ArticleObj[];
  articlesCount: number;
} | ErrorResponse;

interface GetArticlesQueryParams {
  tag?: string;
  author?: string;
  favorited?: string;
  offset?: number;
  limit?: number;
}

export type {
  ArticleObj,
  MultipleArticlesResponse,
  GetArticlesQueryParams,
}
