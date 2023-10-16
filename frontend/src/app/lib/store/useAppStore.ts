import { create } from 'zustand';

import { createArticleSlice } from './articleSlice';
import { createAuthSlice } from './authSlice';
import { createMainPageTabSlice } from './mainPageTabSlice';
import { createTagSlice } from './tagSlice';

export const useAppStore = create<AppStore>()(
  ((...a) => ({
    ...createArticleSlice(...a),
    ...createAuthSlice(...a),
    ...createMainPageTabSlice(...a),
    ...createTagSlice(...a),
  }))
)