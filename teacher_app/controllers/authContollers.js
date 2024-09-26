const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const TeacherDetailModel = require('../../models/teacher/TeacherDetailModel');


// create Access JWT Token
const AccessToken = (id, sessionid) => {
    return jwt.sign({ id: id, sessionid: sessionid }, process.env.JWT_SECRET_TEACHER, { expiresIn: `${process.env.JWT_SECRET_TEACHER_EXP}m` });
}
// create Refresh JWT Token
const RefreshToken = (id, sessionid) => {
    return jwt.sign({ id: id, sessionid: sessionid }, process.env.JWT_REF_SECRET_TEACHER, { expiresIn: `${process.env.JWT_REF_SECRET_TEACHER_EXP}d` });
}

// sending access and refresh JWT Token to user
const createSendToken = (res, user, sessionidA, sessionidR, statuscode, message) => {
    const accessToken = AccessToken(user._id, sessionidA);
    const refreshToken = RefreshToken(user._id, sessionidR);

    // JWT Access-Token
    const accessCookies = {
        expires: new Date(
            Date.now() + parseInt(process.env.JWT_SECRET_TEACHER_EXP) * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Automatically set secure based on environment
    };

    // JWT Refresh-Token
    const refreshCookies = {
        expires: new Date(
            Date.now() + parseInt(process.env.JWT_REF_SECRET_TEACHER_EXP) * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Automatically set secure based on environment
    };

    // send througth cookies of Refresh-Token and Access-Token
    res.cookie('auth.jwt', accessToken, accessCookies);
    res.cookie('auth.ref.jwt', refreshToken, refreshCookies);

    // Remove password from output
    user.password = undefined;

    // send data when login the user
    if (message === "login-successfull") {
        res.status(statuscode).json({
            accessToken, refreshToken,
            status: 'Success',
            message: 'you are login successfully',
            data: user
        });
    }
};


exports.login = catchAsync(async(req, res, next) => {
        const email = req.body.email;
        const password = req.body.password;

        // 1) check if email and password exit
        if (!email || !password) {
            return next(new AppError('Please enter email and password!', 400));
        };
        // 2) check if user exits and password is correct
        const userData = await TeacherDetailModel.findOne({ tid: email }).select('+password');

        if (!userData || !await userData.correctPassword(password, userData.password)) {
            return next(new AppError('Incorrect email or password', 401));
        }
        // created session_id of every refreshToken and accessToken
        const sessionidA = crypto.randomUUID().replace(/-/g, '');
        const sessionidR = crypto.randomUUID().replace(/-/g, '');

        // if everthing true, send token to user
        createSendToken(res, userData, sessionidA, sessionidR, 200, 'login-successfull');
});