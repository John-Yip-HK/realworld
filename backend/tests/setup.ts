vi.mock('bun');
vi.mock('jsonwebtoken');
vi.mock('../prisma/client');

vi.stubEnv('JWT_SECRET', 'dummy-secret')
