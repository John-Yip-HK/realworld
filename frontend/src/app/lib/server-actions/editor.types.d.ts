interface CreateArticleBody {
  article: {
    title: string | null;
    description: string | null;
    body: string | null;
    tagList: string[] | null;
  }
}

type UpdateArticleBody = CreateArticleBody;

type CreateArticleResponse = { article: Article } | ResponseError;
type UpdateArticleResponse = CreateArticleResponse;
