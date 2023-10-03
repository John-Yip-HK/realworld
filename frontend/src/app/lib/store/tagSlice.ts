import { type StateCreator } from 'zustand';

export const createTagSlice: StateCreator<
  TagSlice
> = (set) => ({
  selectedTag: undefined,
  setTag: (tag) => set(() => ({ selectedTag: tag, })),
  resetTag: () => set(() => ({ selectedTag: undefined })),
});