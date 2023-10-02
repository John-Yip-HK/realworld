import { create } from 'zustand';

interface AuthState {
  authToken?: string;
}

interface AuthActions {
  setAuthToken: (token: string) => void;
  resetToken: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()((set) => ({
  authToken: undefined,
  setAuthToken: (token) => set(() => ({ authToken: token })),
  resetToken: () => set(() => ({ authToken: undefined })),
}));