import { create } from 'zustand';
import { createAuthSlice } from './authSlice';
import { createTagSlice } from './tagSlice';
import { createArticleSlice } from './articleSlice';

export const useAppStore = create<AppStore>()((...a) => ({
  ...createAuthSlice(...a),
  ...createTagSlice(...a),
  ...createArticleSlice(...a),
}))