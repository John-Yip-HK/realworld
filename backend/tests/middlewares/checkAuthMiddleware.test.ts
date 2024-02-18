import { Request, Response } from 'express';
import { Mock } from 'vitest';

import { checkAuthMiddleware } from '../../middlewares/checkAuthMiddleware';

import statusCodes from '../../constants/status-codes';
import { UNAUTHORIZED_ERROR } from '../../constants/user';

const { UNAUTHORIZED, FORBIDDEN, INTERNAL_SERVER_ERROR } = statusCodes

describe('checkAuthMiddleware', () => {
  let req: Request;
  let res: Response;
  let next: Mock;

  beforeEach(() => {
    req = {
      headers: {},
      authInfo: null,
      user: null,
    } as unknown as Request;

    res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as Response;

    next = vi.fn();
  });

  it('should return UNAUTHORIZED if token is missing', () => {
    checkAuthMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(UNAUTHORIZED.code);
    expect(res.send).toHaveBeenCalledWith(UNAUTHORIZED_ERROR);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return FORBIDDEN if authInfo is present', () => {
    req.headers.authorization = 'Bearer token';
    req.authInfo = { message: 'Forbidden' };

    checkAuthMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(FORBIDDEN.code);
    expect(res.send).toHaveBeenCalledWith(req.authInfo);
    expect(next).not.toHaveBeenCalled();
  });

  it('should set token in req.user if user exists', () => {
    req.headers.authorization = 'Bearer token';
    req.user = {} as Express.User;

    checkAuthMiddleware(req, res, next);

    expect(req.user.token).toBe('token');
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should return INTERNAL_SERVER_ERROR if user is missing', () => {
    req.headers.authorization = 'Bearer token';

    checkAuthMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR.code);
    expect(res.send).toHaveBeenCalledWith({
      error: INTERNAL_SERVER_ERROR.message,
      details: 'User information has lost unexpectedly.',
    });
    expect(next).not.toHaveBeenCalled();
  });
});