import { create } from 'zustand';

import { createArticleSlice } from './articleSlice';
import { createMainPageTabSlice } from './mainPageTabSlice';
import { createTagSlice } from './tagSlice';

export const useAppStore = create<AppStore>()(
  ((...a) => ({
    ...createArticleSlice(...a),
    ...createMainPageTabSlice(...a),
    ...createTagSlice(...a),
  }))
)