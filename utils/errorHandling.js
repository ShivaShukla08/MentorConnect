const AppError = require('../utils/appError');  // Import the AppError class
const mongoose = require('mongoose');

// Global error-handling middleware
const globalErrorHandler = (err, req, res, next) => {
  console.error('ERROR 💥', err);

  // Set a default error status code and message
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle specific Mongoose validation errors
  if (err.code === 11000) {
    // Duplicate key error
    const field = Object.keys(err.keyValue)[0]; // Get the field that caused the error
    const value = err.keyValue[field]; // Get the value that was duplicated
    const message = `Duplicate field value: ${value}. Please use another value for ${field}.`;
    return res.status(400).json({
      status: 'fail',
      message: message
    });
  }

  // Handle specific Mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    return res.status(400).json({
      status: 'fail',
      message: message,
    });
  }

  // Send the generic error response
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

module.exports = globalErrorHandler;

