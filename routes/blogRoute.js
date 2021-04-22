const router = require('express').Router()
const { requireLogin } = require('../controllers/authController');
const { create, list, read, remove, update, photo, listRelated, listSearch } = require('../controllers/blogController');

router.post('/blog', requireLogin, create)
router.get('/blogs', list)
router.get('/blog/:slug', read)
router.delete('/blog/:slug', requireLogin, remove)
router.put('/blog/:slug', requireLogin, update)
router.get('/blog/photo/:slug', photo)
router.post('/blogs/related', listRelated)
router.get('/blog/search', listSearch)


module.exports = router;