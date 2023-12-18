import passport from 'passport';
import { 
  Strategy as JwtStrategy, 
  ExtractJwt,
} from 'passport-jwt';
import { PrismaClient } from '@prisma/client';

import { JWT_SECRET } from '../constants/app';
import { handleUserResponse } from '../utils/handleUserResponseUtils';
import { extractJwtFromHeader } from '../utils/jwtUtils';

const prisma = new PrismaClient();

const { fromAuthHeaderAsBearerToken, fromExtractors, fromHeader } = ExtractJwt;

passport.use(new JwtStrategy(
  {
    secretOrKey: JWT_SECRET,
    jwtFromRequest: fromExtractors([
      fromAuthHeaderAsBearerToken(), 
      (req) => {
        const token = extractJwtFromHeader(fromHeader('authorization')(req));
        return token ?? null;
      }
    ]),
  }, 
  async (jwtPayload, done) => {
    const dummyUser: any = {};

    try {
      const user = await prisma.users.findUnique({
        where: {
          email: jwtPayload.email,
        }
      });

      if (!user) {
        return done(null, dummyUser, {
          errors: {
            'user': ['does not exist.'],
          }
        });
      }

      done(null, handleUserResponse(user, '').user);
    } catch (error) {
      done(null, dummyUser, error);
    }
  }
));