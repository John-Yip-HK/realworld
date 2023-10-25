interface UnauthorizedError {
  status: "error";
  message: "missing authorization credentials";
};

interface UnexpectedError {
  errors: Record<string, string[]>;
};

type ServerError = string;

type ConduitApiError = UnauthorizedError | UnexpectedError | ServerError;
