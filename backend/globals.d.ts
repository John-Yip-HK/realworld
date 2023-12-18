import type { User as RealworldUser } from './routes/User';

type ErrorsObj = Record<string, string[]>;
type ErrorResponse = 
  (
    {
      error: string;
    } 
    & Record<string, unknown>
  ) 
  | {
    errors: ErrorsObj;
  };

declare global {
  namespace Express {
    interface User extends RealworldUser {}
  }
}