'use client';

import { type MouseEventHandler, useState } from 'react';

import Tab from '@/app/components/Tab';
import TabContainer from '@/app/components/TabContainer';
import { useProfileArticles } from '@/app/lib/hooks/swr/useProfileArticles';
import Pagination from '@/app/components/Pagination';
import ArticlePreviews from '@/app/components/ArticlePreviews';

import { ARTICLES_PER_PAGE, tabs } from '@/app/constants/profile';

type ProfileArticlesProps = {
  isLoggedIn: boolean;
  username: string;
}

export default function ProfileArticles({
  isLoggedIn,
  username,
}: ProfileArticlesProps) {
  const [selectedTab, setSelectedTab] = useState(tabs[0].linkName);
  const [currentPage, setCurrentPage] = useState(0);
  const { 
    isValidating: loadingProfileArticles, 
    articles = [], 
    error,
    articlesCount = 0, 
  } = useProfileArticles(username, selectedTab, currentPage, isLoggedIn);

  const onTabClick = (linkName: string): MouseEventHandler<HTMLAnchorElement> => (event) => {
    event.preventDefault();

    setSelectedTab(linkName);
  };

  const onPageLinkClick = (pageNum: number) => {
    setCurrentPage(pageNum);
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-xs-12 col-md-10 offset-md-1">
          <div className="articles-toggle">
            <TabContainer>
              {
                tabs.map((tab) => (
                  <Tab
                    key={tab.label}
                    isActive={tab.linkName === selectedTab}
                    onTabClick={onTabClick}
                    {...tab}
                  />
                ))
              }
            </TabContainer>
          </div>

          <ArticlePreviews 
            articles={articles}
            error={error}
            isLoggedIn={isLoggedIn} 
            loadingArticles={loadingProfileArticles} 
          />

          <Pagination
            numItems={articlesCount}
            itemsPerPage={ARTICLES_PER_PAGE}
            currentPage={currentPage}
            onPageLinkClick={onPageLinkClick}
          />
        </div>
      </div>
    </div>
  )
}