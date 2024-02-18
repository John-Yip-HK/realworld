import prisma from '../../prisma/__mocks__/client';
import * as handleUserResponseUtils from '../../utils/handleUserResponseUtils';
import { jwtVerifier } from '../../strategies/jwtStrategy';

describe('jwtVerifier', () => {
  const dummyUser = {};
  const jwtPayload = { email: 'test@example.com' };
  const done = vi.fn();

  test('should call done with dummy user and error arguments if user does not exist', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);

    await jwtVerifier(jwtPayload, done);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        email: jwtPayload.email,
      },
    });
    expect(done).toHaveBeenCalledWith(null, dummyUser, {
      errors: {
        user: ['does not exist.'],
      },
    });
  });

  test('should call done with user response if user exists', async () => {
    const user = {
      id: 1,
      email: 'test@example.com',
      username: '',
      bio: null,
      image: '',
      token: '',
      hashedPassword: '',
      followedUsers: [],
    };
    vi.spyOn(handleUserResponseUtils, 'handleUserResponse').mockReturnValueOnce({ user });

    prisma.user.findUnique.mockResolvedValueOnce(user);

    await jwtVerifier(jwtPayload, done);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        email: jwtPayload.email,
      },
    });
    expect(handleUserResponseUtils.handleUserResponse).toHaveBeenCalledWith(user, '', true);
    expect(done).toHaveBeenCalledWith(null, user);
  });

  test('should call done with dummy user and error if an error occurs', async () => {
    const error = new Error('Something went wrong');

    prisma.user.findUnique.mockRejectedValueOnce(error);

    await jwtVerifier(jwtPayload, done);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        email: jwtPayload.email,
      },
    });
    expect(done).toHaveBeenCalledWith(null, dummyUser, error);
  });
});
