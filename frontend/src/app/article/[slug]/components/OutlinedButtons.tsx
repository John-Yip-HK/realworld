import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { AiFillHeart, AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';
import { useContext } from 'react';
import path from 'path';

import OutlinedButton, { type OutlinedButtonProps } from '@/app/components/OutlinedButton';
import { followUserServerAction } from '@/app/lib/server-actions/article';
import { fetchFromClient } from '@/app/lib/api/fetchFromClient';
import { SharedStatesContext } from '@/app/lib/article/SharedStatesProvider';

import { ARTICLES_PATH } from '@/app/api/constants';

import './styles.scss';

type OutlinedButtonsProps = {
  currentUserIsAuthorOfArticle: boolean;
  isLoggedIn: boolean;
  articleProps: Pick<Article, 'slug'> & {
    username: Article['author']['username']
  }
}

export default function OutlinedButtons({
  currentUserIsAuthorOfArticle,
  isLoggedIn,
  articleProps,
}: OutlinedButtonsProps) {
  const { username, slug, } = articleProps;

  const router = useRouter();

  const {
    followingUserStatus: [mutatingFollowStatus, setMutatingFollowStatus],
    followUserStates: [followingUser, mutateOptimisticFollowStatus],
    optimisticUpdateFavoriteStates: { 
      toggleFavorite,
      favoritedStatus: { 
        favoritesCount: optimisticFavoritesCount, 
        favorited: optimisticFavorited,
      },
      mutatingFavoriteStatus,
    },
  } = useContext(SharedStatesContext);

  const deleteArticle = async () => {
    const deleteArticleResponse = await fetchFromClient(
      `${ARTICLES_PATH}/${slug}`,
      {
        method: 'DELETE',
      }
    );

    if (deleteArticleResponse) {
      throw new Error(JSON.stringify(deleteArticleResponse));
    } else {
      router.replace('/');
    }
  };

  const outlinedButtons: (OutlinedButtonProps & {
    shouldShow: boolean;
    key: string;
  })[] = [
    {
      key: 'follow',
      type: 'secondary',
      className: clsx(
        followingUser ? 'following-user' : undefined, 
        mutatingFollowStatus ? 'mutating-status' : undefined
      ),
      disabled: mutatingFollowStatus,
      shouldShow: !isLoggedIn || !currentUserIsAuthorOfArticle,
      onClick: async () => {
        if (!isLoggedIn) {
          router.push('/login');
        } else {
          setMutatingFollowStatus(true);
          mutateOptimisticFollowStatus(followingUser);
          await followUserServerAction(username, slug, followingUser);
          setMutatingFollowStatus(false);
        }
      },
      children: (
        <>
          {followingUser ? <AiOutlineMinus /> : <AiOutlinePlus />}&nbsp;{followingUser ? 'Unfollow' : 'Follow'} {username}
        </>
      )
    },
    {
      key: 'favorite',
      type: 'primary',
      className: clsx(
        optimisticFavorited ? 'article-favorited' : undefined, 
        mutatingFavoriteStatus ? 'mutating-status' : undefined
      ),
      disabled: mutatingFavoriteStatus,
      shouldShow: !currentUserIsAuthorOfArticle,
      onClick: async () => {
        if (!isLoggedIn) {
          router.push('/login');
        } else {
          await toggleFavorite(path.join('/article', slug));
        }
      },
      children: (
        <>
          <AiFillHeart />&nbsp;{optimisticFavorited ? 'Unfavorite' : 'Favorite'} Article&nbsp;<span className="counter">({optimisticFavoritesCount})</span>
        </>
      ),
    },
    {
      key: 'edit',
      type: 'secondary',
      shouldShow: currentUserIsAuthorOfArticle,
      onClick: () => {
        router.push(`/editor/${slug}`);
      },
      children: 'Edit Article',
    },
    {
      key: 'delete',
      type: 'danger',
      shouldShow: currentUserIsAuthorOfArticle,
      onClick: deleteArticle,
      children: 'Delete Article',
    },
  ];
  
  return outlinedButtons.map(({ shouldShow, key, className, ...buttonProps }, index) => (
    shouldShow ?
      <>
        <OutlinedButton
          className={clsx('btn-caption-with-icon', className)}
          size="sm"
          key={key}
          {...buttonProps}
        />
        {index < outlinedButtons.length - 1 ? 
          <>
            &nbsp;
          </> :
          null
        }
      </> :
      null
  ));
}