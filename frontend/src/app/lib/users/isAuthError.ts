export function isAuthError(obj: any): obj is AuthError {
  return obj !== null &&
    typeof obj === 'object' &&
    Object.entries(obj).every(([key, value]) => typeof key === 'string' && Array.isArray(value));
}