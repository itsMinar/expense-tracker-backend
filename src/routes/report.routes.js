const { Router } = require('express');
const { generate } = require('../controllers/report.controller');
const { verifyJWT } = require('../middlewares/auth.middleware');

const router = Router();

router.use(verifyJWT);
router.get('/', generate);

module.exports = router;
