const router = require('express').Router()
const { create, read, remove, list } = require('../controllers/tagController')

router.post('/tag', create)
router.get('/tag/:slug', read)
router.get('/tags', list)
router.delete('/tag/:slug', remove)

module.exports = router