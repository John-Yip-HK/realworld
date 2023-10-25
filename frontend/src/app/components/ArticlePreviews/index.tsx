import ArticlePreview from './components/ArticlePreview';
import './styles.scss';

interface ArticlePreviewsProps extends Pick<GetArticlesSuccessResponse, 'articles'> {
  error: unknown;
  isLoggedIn: boolean;
  loadingArticles: boolean;
}

export default function ArticlePreviews({
  articles,
  error,
  isLoggedIn,
  loadingArticles,
}: ArticlePreviewsProps) {
  const shouldShowBottomDiv = loadingArticles || articles?.length === 0 || error;
  const divCls = shouldShowBottomDiv ? 'article-preview' : 'article-preview--hidden';
  const caption = loadingArticles ?
    'Loading articles...' :
    (
      articles?.length === 0 ?
        'No articles are here... yet.' :
        (
          error ?
            'Error occured. Please reload again.' :
            null
        )
    );
  
  return (
    <>
      {
        articles.map((article) => (
          <ArticlePreview
            key={article.slug}
            article={article}
            isLoggedIn={isLoggedIn}
          />
        ))
      }
      <div className={divCls}>
        <p>{caption}</p>
      </div>
    </>
  )
}