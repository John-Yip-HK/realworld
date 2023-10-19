'use client';

import { useArticles } from '@/app/lib/hooks/swr/useArticles';

import ArticlePreview from './components/ArticlePreview';

import './styles.scss';

interface ArticlePreviewsProps {
  isLoggedIn: boolean;
}

export default function ArticlePreviews({
  isLoggedIn,
}: ArticlePreviewsProps) {
  const { articles, isValidating: loadingArticles, error } = useArticles(isLoggedIn);
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
        articles?.map(article => (
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
  );
}
