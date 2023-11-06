import { 
  type PropsWithChildren, 
  createContext, 
  useOptimistic, 
  useState 
} from 'react';

import { useOptimisticUpdateFavoriteState } from '../hooks/useOptimisticUpdateFavoriteStatus';

type SharedStatesProviderProps = PropsWithChildren<{
  initFollowing: boolean;
  initFavoriteStates: Pick<Article, 'slug' | 'favorited' | 'favoritesCount'>;
}>

interface SharedStates {
  followingUserStatus: [boolean, (newFollowingStatus: boolean) => void];
  followUserStates: [boolean, (action: boolean) => void];
  optimisticUpdateFavoriteStates: ReturnType<typeof useOptimisticUpdateFavoriteState>,
}

export const SharedStatesContext = createContext<SharedStates>({
  followingUserStatus: [false, () => {}],
  followUserStates: [false, () => {}],
  optimisticUpdateFavoriteStates: {
    favoritedStatus: {
      favorited: false,
      favoritesCount: 0,
    },
    mutatingFavoriteStatus: false,
    toggleFavorite: (_?: string | undefined) => Promise.resolve(),
  },
});

export default function SharedStatesProvider({ 
  children,
  initFollowing,
  initFavoriteStates,
}: SharedStatesProviderProps) {
  const followingUserStatus = useState(false);
  const followUserStates = useOptimistic<boolean, boolean>(initFollowing, currFollowState => !currFollowState);

  const optimisticUpdateFavoriteStates = useOptimisticUpdateFavoriteState(initFavoriteStates);

  return (
    <SharedStatesContext.Provider value={{
      followingUserStatus,
      followUserStates,
      optimisticUpdateFavoriteStates,
    }}>
      {children}
    </SharedStatesContext.Provider>
  )
}