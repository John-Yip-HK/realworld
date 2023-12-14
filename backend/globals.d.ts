import type { User as RealworldUser } from './routes/User';

declare global {
  namespace Express {
    interface User extends RealworldUser {}
  }
}
