'use client';

import { useArticles } from '@/app/lib/hooks/swr/useArticles';
import ArticlePreviews from '@/app/components/ArticlePreviews';

import './styles.scss';

interface ArticlePreviewsContainerProps {
  isLoggedIn: boolean;
}

export default function ArticlePreviewsContainer({
  isLoggedIn,
}: ArticlePreviewsContainerProps) {
  const { articles = [], isValidating: loadingArticles, error } = useArticles(isLoggedIn);
  
  return (
    <ArticlePreviews
      articles={articles} 
      error={error} 
      isLoggedIn={isLoggedIn} 
      loadingArticles={loadingArticles}    
    />
  );
}
