import { create } from 'zustand'

type BearStore = {
  bears: number;
  addABear: () => void;
};

export const useBearStore = create<BearStore>(
  (set, get) => ({
    bears: 0,
    addABear: () => set({ bears: get().bears + 1 }),
  }),
)