const router = require('express').Router()
const { create, read, update, remove, list, photo } = require('../controllers/categoryController')

router.post('/category', create)
router.get('/category/:slug', read)
router.get('/categories', list)
router.put('/category/:slug', update)
router.delete('/category/:slug', remove)
router.get('/category/photo/:slug', photo)


module.exports = router