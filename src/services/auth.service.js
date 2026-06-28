const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const CustomError = require('../utils/Error');
const {
  JWT_ACCESS_TOKEN_SECRET,
  JWT_ACCESS_TOKEN_EXPIRY,
  JWT_REFRESH_TOKEN_SECRET,
  JWT_REFRESH_TOKEN_EXPIRY,
} = require('../config/env');

const generateAccessToken = (userId) => {
  return jwt.sign({ _id: userId }, JWT_ACCESS_TOKEN_SECRET, {
    expiresIn: JWT_ACCESS_TOKEN_EXPIRY,
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ _id: userId }, JWT_REFRESH_TOKEN_SECRET, {
    expiresIn: JWT_REFRESH_TOKEN_EXPIRY,
  });
};

const generateTokens = async (userId) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  await User.findByIdAndUpdate(userId, {
    $set: { refreshToken },
  });

  return { accessToken, refreshToken };
};

const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw CustomError.conflict({
      message: 'User already exists',
      errors: ['An account with this email already exists'],
      hints: 'Please login or use a different email',
    });
  }

  const user = await User.create({ name, email, password });
  const { accessToken, refreshToken } = await generateTokens(user._id);

  const createdUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  return {
    user: createdUser,
    accessToken,
    refreshToken,
  };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw CustomError.unauthenticated({
      message: 'Invalid credentials',
      errors: ['Email or password is incorrect'],
      hints: 'Please check your credentials and try again',
    });
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw CustomError.unauthenticated({
      message: 'Invalid credentials',
      errors: ['Email or password is incorrect'],
      hints: 'Please check your credentials and try again',
    });
  }

  const { accessToken, refreshToken } = await generateTokens(user._id);
  const loggedInUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  return {
    user: loggedInUser,
    accessToken,
    refreshToken,
  };
};

const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, {
    $set: { refreshToken: null },
  });
};

const refreshAccessToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw CustomError.unauthenticated({
      message: 'Refresh token required',
      errors: ['No refresh token provided'],
      hints: 'Please login again',
    });
  }

  const decoded = jwt.verify(incomingRefreshToken, JWT_REFRESH_TOKEN_SECRET);
  const user = await User.findById(decoded._id).select('+refreshToken');

  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw CustomError.unauthenticated({
      message: 'Invalid refresh token',
      errors: ['Refresh token is invalid or expired'],
      hints: 'Please login again',
    });
  }

  const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
    user._id
  );

  return { accessToken, refreshToken: newRefreshToken };
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select('-password -refreshToken');
  if (!user) {
    throw CustomError.notFound({
      message: 'User not found',
      errors: ['User does not exist'],
      hints: 'Please check your account',
    });
  }
  return user;
};

const updateUserProfile = async (userId, updateData) => {
  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select('-password -refreshToken');

  if (!user) {
    throw CustomError.notFound({
      message: 'User not found',
      errors: ['User does not exist'],
      hints: 'Please check your account',
    });
  }
  return user;
};

const changeUserPassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw CustomError.notFound({
      message: 'User not found',
      errors: ['User does not exist'],
      hints: 'Please check your account',
    });
  }

  const isPasswordValid = await user.isPasswordCorrect(currentPassword);
  if (!isPasswordValid) {
    throw CustomError.badRequest({
      message: 'Invalid current password',
      errors: ['Current password is incorrect'],
      hints: 'Please provide the correct current password',
    });
  }

  user.password = newPassword;
  await user.save();

  return user;
};

const deleteUserAccount = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw CustomError.notFound({
      message: 'User not found',
      errors: ['User does not exist'],
      hints: 'Please check your account',
    });
  }
  return { message: 'Account deleted successfully' };
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  updateUserProfile,
  changeUserPassword,
  deleteUserAccount,
};
