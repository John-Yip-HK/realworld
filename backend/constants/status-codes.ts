export default {
  CREATED: {
    message: 'Created',
    code: 201,
  },
  NO_CONTENT: {
    message: 'No Content',
    code: 204,
  },
  BAD_REQUEST: {
    message: 'Bad Request',
    code: 400,
  },
  UNAUTHORIZED: {
    message: 'Unauthorized',
    code: 401,
  },
  FORBIDDEN: {
    message: 'Forbidden',
    code: 403,
  },
  NOT_FOUND: {
    message: 'Not Found',
    code: 404,
  },
  UNPROCESSABLE_ENTITY: {
    message: 'Unprocessable Entity',
    code: 422,
  },
  INTERNAL_SERVER_ERROR: {
    message: 'Internal Server Error',
    code: 500,
  },
} as const;