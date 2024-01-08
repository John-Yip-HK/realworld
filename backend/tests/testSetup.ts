vi.mock('bun', () => ({
  // Used by `backend/utils/passwordUtils`
  password: vi.fn(),
}));
