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
  author: {
    username: string;
    bio: string;
    image: string;
    following: boolean;
  }
};

interface GetArticlesSuccessResponse {
  articles: Article[];
  articlesCount: number;
};
type GetArticlesError = Record<string, string[]>;
interface GetArticlesErrorResponse {
  errors: GetArticlesError;
};

type GetArticlesResponse = GetArticlesErrorResponse | GetArticlesSuccessResponse;
