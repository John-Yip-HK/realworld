export default {
  CREATED: {
    message: 'Created',
    code: 201,
  },
  BAD_REQUEST: {
    message: 'Bad Request',
    code: 400,
  },
  FORBIDDEN: {
    message: 'Forbidden',
    code: 403
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