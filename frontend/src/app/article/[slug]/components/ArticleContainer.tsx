'use client';

import { sanitize } from 'isomorphic-dompurify';
import { marked } from 'marked';

import SharedStatesProvider from '@/app/lib/article/SharedStatesProvider';

import ArticleMeta from './ArticleMeta';
import TagList from '@/app/components/TagList';
import CommentSession from './CommentSection';

type ArticleContainerProps = {
  article: Article;
  comments: Comment[];
  userImageUrl: string;
  username: string;
  isLoggedIn: boolean;
  isOwnerVisitingArticle: boolean;
}

export default function ArticleContainer({
  article,
  comments,
  userImageUrl,
  username,
  isLoggedIn,
  isOwnerVisitingArticle,
}: ArticleContainerProps) {
  const { 
    body,
    title,
    favorited,
    favoritesCount,
    tagList,
    slug,
    author,
  } = article;
  const { following } = author;
  
  const parsedBody = {
    __html: sanitize(marked.parse(body.replace(/\\n/g, '\n'))),
  };

  const articleMeta = (
    <ArticleMeta 
      article={article} 
      isLoggedIn={isLoggedIn} 
      isOwnerVisitingArticle={isOwnerVisitingArticle}
    />
  );
  
  return (
    <SharedStatesProvider
      initFollowing={following}
      initFavoriteStates={{
        slug,
        favorited,
        favoritesCount,
      }}
    >
      <div className="banner">
        <div className="container">
          <h1>{title}</h1>
          {articleMeta}
        </div>
      </div>

      <div className="container page">
        <div className="row article-content">
          <div className="col-md-12" dangerouslySetInnerHTML={parsedBody} />
        </div>
        <TagList tagList={tagList} />
        <hr />

        <div className="article-actions">
          {articleMeta}
        </div>

        <CommentSession 
          isLoggedIn={isLoggedIn} 
          comments={comments}
          username={username}
          articleSlug={slug}
          userImageUrl={userImageUrl}
        />
      </div>
    </SharedStatesProvider>
  )
}