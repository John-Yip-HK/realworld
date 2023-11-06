import Link from 'next/link';
import Image from 'next/image';
import path from 'path';

import { getLocaleString } from '@/app/lib/utils';

import OutlinedButtons from './OutlinedButtons';

import { PROFILE_NAV_PATH } from '@/app/constants/profile';

interface ArticleMetaProps {
  article: Article;
  isLoggedIn: boolean;
  isOwnerVisitingArticle: boolean;
}

const ArticleMeta: React.FC<ArticleMetaProps> = ({ article, isLoggedIn, isOwnerVisitingArticle }) => {
  const { author: { image: imagePath, username }, createdAt, slug } = article;
  
  const userProfilePath = path.join(PROFILE_NAV_PATH, username);
  const localeCreatedDate = getLocaleString(createdAt, {
    month: 'short',
  });
  
  return (
    <div className="article-meta">
      <Link href={userProfilePath}>
        <Image 
          src={imagePath} 
          alt={`Image of article owner ${username}`} 
          width={32} 
          height={32} 
        />
      </Link>
      <div className="info">
        <Link href={userProfilePath} className="author">
          {username}
        </Link>
        <span className="date">{localeCreatedDate}</span>
      </div>
      <OutlinedButtons 
        articleProps={{
          slug,
          username,
        }}
        isLoggedIn={isLoggedIn}
        currentUserIsAuthorOfArticle={isOwnerVisitingArticle} 
      />
    </div>
  );
};

export default ArticleMeta;
