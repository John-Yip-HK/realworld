interface CreateArticleBody {
  article: {
    title: string | null;
    description: string | null;
    body: string | null;
    tagList: string[] | null;
  }
}

type CreateArticleResponse = Article | ResponseError;
