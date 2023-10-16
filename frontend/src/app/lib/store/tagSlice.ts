import { type StateCreator } from 'zustand';

export const createTagSlice: StateCreator<
  TagSlice
> = (set) => ({
  tags: [],

  setTags: (tags) => set(() => ({ tags: tags, })),
  resetTags: () => set(() => ({ tags: [] })),
});