const router = require('express').Router()
const { requireLogin } = require('../controllers/authController');
const { create } = require('../controllers/blogController');

router.post('/blog', requireLogin, create)


module.exports = router;