import { useState, type MouseEventHandler, useEffect } from 'react';
import { clsx } from 'clsx';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AiFillHeart } from 'react-icons/ai';
import useSWRMutation from 'swr/mutation';

import { favoriteArticleServerAction } from '@/app/lib/server-actions/article';
import { getLocaleString } from '@/app/lib/utils';

import { SIGN_UP_PATH } from '@/app/constants/user';

import './styles.scss';
import Image from 'next/image';

interface ArticlePreviewProps {
  article: Article;
  isLoggedIn: boolean;
}

export default function ArticlePreview({
  article, isLoggedIn
}: ArticlePreviewProps) {
  const {
    slug,
    title,
    description,
    tagList,
    createdAt,
    favoritesCount,
    favorited,
    author: {
      username,
      image,
    },
  } = article;

  const profileLink = `/profile/${username}`;
  const articleLink = `/article/${slug}`;
  const localeDate = getLocaleString(createdAt);
  const likeBtnProps = {
    slug,
    favoritesCount,
    favorited,
  };

  const tagPills = tagList.map(tag => (
    <li className="tag-default tag-pill tag-outline" key={tag}>
      {tag}
    </li>
  ));

  return (
    <div className="article-preview">
      <div className="article-meta">
        <Link href={profileLink}>
          <Image src={image} alt={`Profile image of ${username}`} width={32} height={32} />
        </Link>
        <div className="info">
          <Link href={profileLink} className="author">{username}</Link>
          <span className="date">{localeDate}</span>
        </div>
        <LikeButton isLoggedIn={isLoggedIn} {...likeBtnProps} />
      </div>
      <Link href={articleLink} className="preview-link">
        <h1>{title}</h1>
        <p>{description}</p>
        <span>Read more...</span>
        <ul className="tag-list">
          {tagPills}
        </ul>
      </Link>
    </div>
  )
}

async function mutateFavoriteState(_: string, { arg: {
  slug,
  favorited,
} }: {
  arg: {
    slug: string;
    favorited: boolean
  }
}): Promise<Article> {
  try {
    const articleResponse: GetArticleResponse = await favoriteArticleServerAction(slug, favorited);

    if ('article' in articleResponse) {
      return articleResponse.article;
    } else {
      throw articleResponse;
    }
  } catch (err) {
    throw new Error(JSON.stringify(err));
  }
}

function useMutateLike({
  slug,
  favorited: initFavorited,
  favoritesCount: initFavoritesCount,
}: Pick<Article, 'slug' | 'favorited' | 'favoritesCount'>) {
  const { data: article, error, trigger: rawTrigger, isMutating } = useSWRMutation('dummy_url', mutateFavoriteState);
  const [favorited, setOptimisedFavorited] = useState(initFavorited);
  const [favoritesCount, setOptimisedFavoritesCount] = useState(initFavoritesCount);

  useEffect(() => {
    if (error) {
      setOptimisedFavoritesCount((prevCount) => prevCount + (favorited ? -1 : +1));
      setOptimisedFavorited((prevFavorite) => !prevFavorite);
    }
    else if (article) {
      const { favorited, favoritesCount } = article;
      
      setOptimisedFavorited(favorited);
      setOptimisedFavoritesCount(favoritesCount);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article, error]);

  const trigger = async () => {
    setOptimisedFavoritesCount((prevCount) => prevCount + (favorited ? -1 : +1));
    setOptimisedFavorited((prevFavorite) => !prevFavorite);

    await rawTrigger({
      slug, favorited,
    });
  };
  
  return {
    optimisedProps: {
      favorited,
      favoritesCount,
    },
    isMutating,
    trigger,
  }
}

function LikeButton({
  isLoggedIn,
  ...articleProps
}: Pick<Article, 'slug' | 'favorited' | 'favoritesCount'> & {
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const { 
    optimisedProps: {
      favorited,
      favoritesCount,
    },
    isMutating,
    trigger, 
  } = useMutateLike(articleProps);

  const favoriteStates = Object.assign(
    {}, 
    articleProps,
    { favorited, favoritesCount, },
  );

  const handleClickLikeBtn: MouseEventHandler<HTMLButtonElement> = async () => {
    if (!isLoggedIn) {
      router.push(SIGN_UP_PATH);
    } else {
      await trigger();
    }
  }
  
  return (
    <button 
      className={clsx(
        'btn btn-outline-primary btn-sm pull-xs-right vertical-align-items',
        isMutating ? 'btn-disabled' : undefined,
        favoriteStates.favorited ? 'btn-liked' : undefined,
      )}
      disabled={isMutating}
      onClick={handleClickLikeBtn}
    >
      <AiFillHeart />&nbsp;{favoriteStates.favoritesCount}
    </button>
  )
}
