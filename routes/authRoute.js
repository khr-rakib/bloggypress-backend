const router = require('express').Router()

const { preRegister, register, login, logout, test } = require('../controllers/authController')
const { runValidation } = require('../validators')
const { userRegisterValidator } = require('../validators/authValidator')

router.post('/pre-register', userRegisterValidator, runValidation, preRegister)
router.post('/register', userRegisterValidator, runValidation, register)
router.post('/login', login)
router.get('/logout', logout)


// test route
router.get('/test', test)


module.exports = router