type GetArticleFeedsSuccessResponse = GetArticlesSuccessResponse;

interface GetArticlesFeedAuthError {
  status: "error";
  message: string;
};

type ErrorMessages = Record<string, string[]>;
interface GetArticlesFeedUnexpectedError {
  errors: ErrorMessages;
};

type GetArticleFeedsResponse = GetArticleFeedsSuccessResponse | GetArticlesFeedUnexpectedError | GetArticlesFeedAuthError;
