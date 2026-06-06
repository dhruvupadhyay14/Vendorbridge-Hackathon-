// Standard response format
export const sendResponse = (res, statusCode, success, message, data = null) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString(),
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

// Success response (200)
export const successResponse = (res, message, data = null, statusCode = 200) => {
  return sendResponse(res, statusCode, true, message, data);
};

// Created response (201)
export const createdResponse = (res, message, data = null) => {
  return sendResponse(res, 201, true, message, data);
};

// Bad Request response (400)
export const badRequestResponse = (res, message, data = null) => {
  return sendResponse(res, 400, false, message, data);
};

// Unauthorized response (401)
export const unauthorizedResponse = (res, message = 'Unauthorized') => {
  return sendResponse(res, 401, false, message);
};

// Forbidden response (403)
export const forbiddenResponse = (res, message = 'Forbidden') => {
  return sendResponse(res, 403, false, message);
};

// Not Found response (404)
export const notFoundResponse = (res, message = 'Not Found') => {
  return sendResponse(res, 404, false, message);
};

// Conflict response (409)
export const conflictResponse = (res, message) => {
  return sendResponse(res, 409, false, message);
};

// Server Error response (500)
export const serverErrorResponse = (res, message = 'Internal Server Error') => {
  return sendResponse(res, 500, false, message);
};
