import { hasAuthCookie } from '@/app/lib/hasAuthCookie';

import ArticlePreviewsContainer from './components/ArticlePreviewsContainer';
import MainPagePagination from './components/MainPagePagination';
import MainPageTabs from './components/MainPageTabs';

export default function MainPage() {
  const hasAuthToken = hasAuthCookie();

  return (
    <>
      <MainPageTabs
        isLoggedIn={hasAuthToken}
      />
      <ArticlePreviewsContainer
        isLoggedIn={hasAuthToken}
      />
      <MainPagePagination />
    </>
  )
}