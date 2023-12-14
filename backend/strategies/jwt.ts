import passport from 'passport';
import { 
  Strategy as JwtStrategy, 
  ExtractJwt,
} from 'passport-jwt';
import { PrismaClient } from '@prisma/client';

import { JWT_SECRET } from '../constants/app';

const prisma = new PrismaClient();

passport.use(new JwtStrategy(
  {
    secretOrKey: JWT_SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
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

      const { hashedPassword, id, ...otherUserAttributes } = user;

      done(null, { ...otherUserAttributes, token: '' });
    } catch (error) {
      done(null, dummyUser, error);
    }
  }
));
