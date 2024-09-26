// Importing all the libraries
const express = require('express');
const morgan = require('morgan');
const cors = require('cors')

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const app = express();

const globalErrorHandler = require('./utils/errorHandling') 

// Importing all the required routes files
const StudentRouter = require('./student_app/routes');
const TeacherRouter = require('./teacher_app/routes');
const AdminRouter = require('./Admin/routes');


//set security http headers
app.use(helmet(
    {
      contentSecurityPolicy: false
    }
));

// Development logs
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//Limit request from same API
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests, please try again in an hour!'
});
app.use('/api/v1/', limiter);

// Body parser, reading data from body into req.body
app.use(express.urlencoded({ extended: true })); 
app.use(express.json({ limit: '2Mb' }));
app.use(cookieParser());

// Data sanitizations against NoSQl query injection
app.use(mongoSanitize())

// API's Routes
app.use('/api/v1/admin',AdminRouter);

// Add global error-handling middleware at the end
app.use(globalErrorHandler);

// Route Handling
module.exports = app;
