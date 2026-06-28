const { Router } = require('express');
const { stats } = require('../controllers/dashboard.controller');
const { verifyJWT } = require('../middlewares/auth.middleware');

const router = Router();

router.use(verifyJWT);
router.get('/', stats);

module.exports = router;
