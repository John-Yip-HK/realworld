import { type StateCreator } from 'zustand';

export const createAuthSlice: StateCreator<
  AuthSlice
> = (set) => ({
  authToken: undefined,
  setAuthToken: (token) => set(() => ({ authToken: token })),
  resetToken: () => set(() => ({ authToken: undefined })),
});