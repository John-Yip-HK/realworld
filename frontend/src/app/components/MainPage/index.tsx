import { hasAuthCookie } from '@/app/lib/hasAuthCookie';

import ArticlePreviews from './components/ArticlePreviews';
import MainPagePagination from './components/MainPagePagination';
import MainPageTabs from './components/MainPageTabs';

export default function MainPage() {
  const hasAuthToken = hasAuthCookie();

  return (
    <>
      <MainPageTabs
        isLoggedIn={hasAuthToken}
      />
      <ArticlePreviews
        isLoggedIn={hasAuthToken}
      />
      <MainPagePagination />
    </>
  )
}