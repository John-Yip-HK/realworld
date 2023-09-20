export function isSignUpUserError(obj: any): obj is SignUpUserError {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    (
      'username' in obj && Array.isArray(obj.username) ||
      'email' in obj && Array.isArray(obj.email) ||
      'password' in obj && Array.isArray(obj.password)
    )
  );
}