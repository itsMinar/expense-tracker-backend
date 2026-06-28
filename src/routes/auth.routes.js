const { Router } = require('express');
const {
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
} = require('../controllers/auth.controller');
const { verifyJWT } = require('../middlewares/auth.middleware');
const { authLimiter } = require('../middlewares/rateLimiter.middleware');

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', verifyJWT, logout);
router.post('/refresh', refresh);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

router.get('/me', verifyJWT, getMe);
router.patch('/profile', verifyJWT, updateProfile);
router.patch('/change-password', verifyJWT, changePassword);
router.delete('/delete-account', verifyJWT, deleteAccount);

module.exports = router;
