import { useOptimistic, useState } from 'react';

import { favoriteArticleServerAction } from '../server-actions/article';

type UseOptimisticUpdateFavoriteStateProps = Pick<Article, 'favorited' | 'favoritesCount' | 'slug'>;
type OptismisticUpdateParams = Omit<UseOptimisticUpdateFavoriteStateProps, 'slug'>;

export const useOptimisticUpdateFavoriteState = ({ slug, ...initialState }: UseOptimisticUpdateFavoriteStateProps) => {
  const [favoritedStatus, mutateOptimisticFavoriteStatus] = useOptimistic<OptismisticUpdateParams, void>(initialState, (currFavoriteState) => ({
    favorited: !currFavoriteState.favorited,
    favoritesCount: currFavoriteState.favoritesCount + (
      currFavoriteState.favorited ? -1 : 1
    ),
  }));
  const [mutatingFavoriteStatus, setMutatingFavoriteStatus] = useState(false);

  const toggleFavorite = async (pathToRevalidate?: string) => {
    setMutatingFavoriteStatus(true);

    mutateOptimisticFavoriteStatus();
    await favoriteArticleServerAction(slug, initialState.favorited, pathToRevalidate);

    setMutatingFavoriteStatus(false);
  };

  return {
    favoritedStatus, 
    mutatingFavoriteStatus, 
    toggleFavorite 
  };
};
