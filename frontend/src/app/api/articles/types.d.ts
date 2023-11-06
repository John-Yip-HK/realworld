interface Article {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  /** Date ISO string. */
  createdAt: string;
  /** Date ISO string. */
  updatedAt: string;
  favorited: boolean;
  favoritesCount: number;
  author: ArticleAuthor;
};

interface GetArticlesSuccessResponse {
  articles: Article[];
  articlesCount: number;
};
type GetArticlesErrorResponse = ConduitApiError;

type GetArticlesResponse = GetArticlesErrorResponse | GetArticlesSuccessResponse;

type DeleteArticleResponse = void | GetArticlesErrorResponse;
