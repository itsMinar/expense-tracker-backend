const jwt = require('jsonwebtoken');
const CustomError = require('../utils/Error');
const { asyncHandler } = require('../utils/asyncHandler');
const { JWT_ACCESS_TOKEN_SECRET } = require('../config/env');
const User = require('../models/user.model');

const verifyJWT = asyncHandler(async (req, _res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return next(
      CustomError.unauthenticated({
        message: 'Authentication required',
        errors: ['Access token is missing'],
        hints: 'Please login to continue',
      })
    );
  }

  try {
    const decoded = jwt.verify(token, JWT_ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded._id).select('-password');

    if (!user) {
      return next(
        CustomError.unauthenticated({
          message: 'Invalid access token',
          errors: ['User not found'],
          hints: 'Please login again',
        })
      );
    }

    req.user = user;
    next();
  } catch (error) {
    return next(
      CustomError.unauthenticated({
        message: 'Invalid or expired access token',
        errors: [error.message],
        hints: 'Please login again',
      })
    );
  }
});

module.exports = { verifyJWT };
