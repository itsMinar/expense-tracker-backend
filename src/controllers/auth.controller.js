const { asyncHandler } = require('../utils/asyncHandler');
const { ApiResponse } = require('../utils/ApiResponse');
const authService = require('../services/auth.service');
const { validate } = require('../utils/validation');
const {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../validators/auth.validator');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
};

const register = asyncHandler(async (req, res) => {
  const data = validate(registerSchema, req.body);
  const { user, accessToken, refreshToken } =
    await authService.registerUser(data);

  res
    .status(201)
    .cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    })
    .cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json(new ApiResponse(201, { user, accessToken, refreshToken }, 'Account created successfully'));
});

const login = asyncHandler(async (req, res) => {
  const data = validate(loginSchema, req.body);
  const { user, accessToken, refreshToken } =
    await authService.loginUser(data);

  res
    .status(200)
    .cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    })
    .cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json(new ApiResponse(200, { user, accessToken, refreshToken }, 'Login successful'));
});

const logout = asyncHandler(async (_req, res) => {
  await authService.logoutUser(_req.user._id);

  res
    .status(200)
    .clearCookie('accessToken', { ...cookieOptions })
    .clearCookie('refreshToken', { ...cookieOptions })
    .json(new ApiResponse(200, null, 'Logged out successfully'));
});

const refresh = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  const { accessToken, refreshToken } =
    await authService.refreshAccessToken(incomingRefreshToken);

  res
    .status(200)
    .cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    })
    .cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json(new ApiResponse(200, { accessToken, refreshToken }, 'Token refreshed'));
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user._id);
  res.status(200).json(new ApiResponse(200, { user }));
});

const updateProfile = asyncHandler(async (req, res) => {
  const data = validate(updateProfileSchema, req.body);
  const user = await authService.updateUserProfile(req.user._id, data);
  res
    .status(200)
    .json(new ApiResponse(200, { user }, 'Profile updated successfully'));
});

const changePassword = asyncHandler(async (req, res) => {
  const data = validate(changePasswordSchema, req.body);
  await authService.changeUserPassword(
    req.user._id,
    data.currentPassword,
    data.newPassword
  );
  res
    .status(200)
    .json(new ApiResponse(200, null, 'Password changed successfully'));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const data = validate(forgotPasswordSchema, req.body);
  // UI-only flow - in production, send email
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { email: data.email },
        'If the email exists, a reset link has been sent'
      )
    );
});

const resetPassword = asyncHandler(async (req, res) => {
  const data = validate(resetPasswordSchema, req.body);
  // UI-only flow
  res
    .status(200)
    .json(new ApiResponse(200, null, 'Password reset successful'));
});

const deleteAccount = asyncHandler(async (req, res) => {
  await authService.deleteUserAccount(req.user._id);
  res
    .status(200)
    .clearCookie('accessToken', { ...cookieOptions })
    .clearCookie('refreshToken', { ...cookieOptions })
    .json(new ApiResponse(200, null, 'Account deleted successfully'));
});

module.exports = {
  register,
  login,
  logout,
  refresh,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  deleteAccount,
};
