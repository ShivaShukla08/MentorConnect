const AppError = require('../utils/appError');

const handleAuthenticationError = () => 
  new AppError('Invalid email or password. Please try again.', 401);


// Handle invalid database field or ID errors
const handleInvalidFieldError = (error) => {
  const errorMessage = `The value '${error.value}' is invalid for field '${error.path}'.`;
  return new AppError(errorMessage, 400);
};

// Handle duplicate fields in the database
const handleDuplicateFieldError = (error) => {
  const duplicateKey = Object.keys(error.keyValue)[0];
  const duplicateValue = error.keyValue[duplicateKey];
  const errorMessage = `Duplicate value found for '${duplicateKey}': '${duplicateValue}'. Please use a different value.`;
  return new AppError(errorMessage, 400);
};

// Handle validation errors from the database
const handleDBValidationErrors = (error) => {
  const validationMessages = Object.values(error.errors).map(({ message }) => message);
  const errorMessage = `Validation failed: ${validationMessages.join('. ')}`;
  return new AppError(errorMessage, 400);
};

// Handle JWT related errors: Invalid Token
const handleInvalidTokenError = () =>
  new AppError('The provided token is invalid. Please authenticate again.', 401);

// Handle JWT expiration errors
const handleExpiredTokenError = () =>
  new AppError('Your session has expired. Please log in again.', 401);

// Log and return error during development
const sendErrorInDev = (error, res) => {
  res.status(error.statusCode).json({
    status: error.status,
    error: error,
    message: error.message,
    stack: error.stack,
  });
};

// Send error in production
const sendErrorInProd = (error, res) => {
  // Operational errors (safe to expose to client)
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    // Log the error and send generic message
    console.error('INTERNAL SERVER ERROR 💥', error);
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred. Please try again later.',
    });
  }
};

// General error handler middleware
globalErrorHandler = (error, req, res, next) => {

  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorInDev(error, res);
  } else if (process.env.NODE_ENV === 'production') {
    let preparedError =  error ;

    // Handle specific error types
    if (preparedError.name === 'CastError') preparedError = handleInvalidFieldError(preparedError);
    if (preparedError.code === 11000) preparedError = handleDuplicateFieldError(preparedError);
    if (preparedError.name === 'ValidationError') preparedError = handleDBValidationErrors(preparedError);
    if (preparedError.name === 'JsonWebTokenError') preparedError = handleInvalidTokenError();
    if (preparedError.name === 'TokenExpiredError') preparedError = handleExpiredTokenError();

    sendErrorInProd(preparedError, res);
  }
};

module.exports = globalErrorHandler;

