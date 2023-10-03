import { create } from 'zustand';
import { createAuthSlice } from './authSlice';
import { createTagSlice } from './tagSlice';

export const useAppStore = create<AuthSlice & TagSlice>()((...a) => ({
  ...createAuthSlice(...a),
  ...createTagSlice(...a),
}))