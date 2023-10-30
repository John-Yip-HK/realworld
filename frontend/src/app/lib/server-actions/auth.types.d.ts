type CredentialType = ReturnType<FormData['get']>;
type UserCredentaialKeys = keyof UserCredentials;

type NewUserCredentials = Record<UserCredentaialKeys, CredentialType>;

/* Sign up user types */
type SignUpUserResponse = Exclude<GetUserResponse, UnauthorizedError>;

/* Log in user types */
type LogInCredentials = Record<Exclude<UserCredentaialKeys, 'username'>, CredentialType>;
type LogInUserResponse = GetUserResponse;
