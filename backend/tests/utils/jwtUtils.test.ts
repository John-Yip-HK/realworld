import * as jwt from 'jsonwebtoken';

import { verifyJwt, extractJwtFromHeader } from '../../utils/jwtUtils';

describe('verifyJwt', () => {
  it('should receive token if token is a "truthy" value.', () => {
    const validJwt = 'valid-jwt-token';

    verifyJwt(validJwt);

    expect(jwt.verify).toHaveBeenCalledWith(validJwt, import.meta.env.JWT_SECRET);
  });

  it('should return undefined for "falsy" values', () => {
    const resultWithUndefined = verifyJwt();
    expect(resultWithUndefined).toBe(undefined);

    const resultWithEmptyString = verifyJwt('');
    expect(resultWithEmptyString).toBe(undefined);
  });
});

describe('extractJwtFromHeader', () => {
  it('should return the JWT from the Authorization header', () => {
    // Arrange
    const header = 'Bearer valid-jwt-token';

    // Act
    const result = extractJwtFromHeader(header);

    // Assert
    expect(result).toBe('valid-jwt-token');
  });

  it('should return undefined if the authorization header is missing', () => {
    let result = extractJwtFromHeader();
    expect(result).toBeUndefined();

    result = extractJwtFromHeader(null);
    expect(result).toBeUndefined();
  });
});