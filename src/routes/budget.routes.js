const { Router } = require('express');
const {
  create,
  list,
  getById,
  update,
  remove,
} = require('../controllers/budget.controller');
const { verifyJWT } = require('../middlewares/auth.middleware');

const router = Router();

router.use(verifyJWT);

router.route('/').get(list).post(create);
router.route('/:id').get(getById).patch(update).delete(remove);

module.exports = router;
