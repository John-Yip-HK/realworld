import { type StateCreator } from 'zustand';

export const createArticleSlice: StateCreator<
  ArticleSlice
> = (set) => ({
  numArticles: 0,
  setNumArticles: (numArticles) => set(() => ({ numArticles, })),
});