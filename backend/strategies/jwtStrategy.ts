import passport from 'passport';
import { 
  Strategy as JwtStrategy, 
  ExtractJwt,
  type VerifiedCallback,
} from 'passport-jwt';

import { handleUserResponse } from '../utils/handleUserResponseUtils';
import { extractJwtFromHeader } from '../utils/jwtUtils';
import { getUserByEmail } from '../dao/usersDao';

import { JWT_SECRET } from '../constants/app';

const { fromAuthHeaderAsBearerToken, fromExtractors, fromHeader } = ExtractJwt;

export const jwtVerifier = async (jwtPayload: any, done: VerifiedCallback) => {
  const dummyUser: any = {};

  try {
    const user = await getUserByEmail(jwtPayload.email!);

    if (!user) {
      return done(null, dummyUser, {
        errors: {
          'user': ['does not exist.'],
        }
      });
    }

    done(null, handleUserResponse(user, '', true).user);
  } catch (error) {
    done(null, dummyUser, error);
  }
}

passport.use(new JwtStrategy(
  {
    secretOrKey: JWT_SECRET,
    jwtFromRequest: fromExtractors([
      fromAuthHeaderAsBearerToken(), 
      (req) => {
        const authHeader = fromHeader('authorization')(req);
        const token = extractJwtFromHeader(authHeader);
        
        return token ?? null;
      }
    ]),
  }, 
  jwtVerifier
));
