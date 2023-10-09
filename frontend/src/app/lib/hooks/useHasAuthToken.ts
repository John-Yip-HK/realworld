import { useAppStore } from '../store/useAppStore';

export function useHasAuthToken() {
  const authToken = useAppStore(store => store.authToken);

  return authToken !== undefined;
}