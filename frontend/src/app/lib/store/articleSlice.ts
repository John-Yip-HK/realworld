import { type StateCreator } from 'zustand';

export const createArticleSlice: StateCreator<
  ArticleSlice
> = (set) => ({
  numArticles: 0,
  /** Zero-based current page number. */
  pageNum: 0,

  setNumArticles: (numArticles) => set(() => ({ numArticles, })),
  setPageNum: (pageNum) => set(() => ({ pageNum, })),
});