const router = require('express').Router()

const { preRegister, register, login, logout, test, forgotPassword, resetPassword } = require('../controllers/authController')
const { runValidation } = require('../validators')
const { userRegisterValidator } = require('../validators/authValidator')

router.post('/pre-register', userRegisterValidator, runValidation, preRegister)
router.post('/register', register)
router.post('/login', login)
router.get('/logout', logout)
router.put('/forgot-password', forgotPassword)
router.put('/reset-password', resetPassword)


// test route
router.get('/test', test)


module.exports = router