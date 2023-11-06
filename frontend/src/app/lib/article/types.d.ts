type GetArticleResponse = {
  article: Article;
} | UnexpectedError;

interface Comment {
  id: number;
  createdAt: string;
  updatedAt: string;
  body: string;
  author: ArticleAuthor;
}
  
type GetCommentResponse = {
  comments: Comment[];
} | ResponseError;

interface AddCommentBody {
  comment: {
    body: string | null;
  }
}
