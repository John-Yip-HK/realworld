import { type StateCreator } from 'zustand';

export const createMainPageTabSlice: StateCreator<
  MainPageTabSlice
> = (set) => ({
  selectedTab: '',

  setSelectedTab: (tab) => set(() => ({ selectedTab: tab, })),
  resetSelectedTab: () => set(() => ({ selectedTab: '', })),
});