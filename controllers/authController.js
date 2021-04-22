const Auth = require('../models/authModel')
const jwt = require('jsonwebtoken')
const expressJwt = require('express-jwt')
const shortId = require('shortid')
const _ = require('lodash')
const { transporter } = require('../utils/common')
const { errorHandler } = require('../helpers/dbErrorHandle')


exports.preRegister = (req, res) => {
    const { name, email, password } = req.body
    
    Auth.findOne({ email: email.toLowerCase() }, ((err, user) => {
        if (user || err) {
            return res.status(400).json({
                error: 'Email is taken'
            })
        }
        const token = jwt.sign({ name, email, password }, process.env.JWT_ACCOUNT_ACTIVATION, { expiresIn: '10m' })

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Account activation link',
            html: `
                <p>Please use the following link to activated your account</p>
                <p>${process.env.CLIENT_URL}/auth/account/activate/${token}</p>
                <hr/>
                <p>This email may contain sensitive information</p>
            `
        }
        transporter.sendMail(mailOptions, function () {
            return res.json({
                message: `Eamil has been sent to ${email} Follow this instruction to activate your account.`
            })
        })
    }))
}

exports.register = (req, res) => {
    const token = req.body.token
    console.log('decode', jwt.decode(token))
    if (token) {
        jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function (err, decoded) {
            console.log('ser', err)
            if (err) {
                return res.status(401).json({
                    error: 'Expired link. Signup again'
                })
            }
            const { name, email, password } = jwt.decode(token)
            let username = shortId.generate()
            let profile = `${process.env.CLIENT_URL}/profile/${username}`
            const user = new Auth({ name, email, password, profile, username })
            user.save((err, data) => {
                console.log(err)
                if (err) {
                    return res.status(401).json({
                        error: errorHandler(err)
                    })
                }
                return res.json({
                    message: 'Signup success! please singin'
                })
            })
            
        })
    } else {
        return res.json({
            message: 'Something went wrong. Try again'
        })
    }
}


exports.login = (req, res) => {
    const { email, password } = req.body
    Auth.findOne({ email })
        .exec((err, user) => {
            console.log(err)
            if (err || !user) {
                return res.status(400).json({
                    error: 'User with that email dose not exists. Please register!'
                })
            }
            if (!user.authenticate(password)) {
                return res.status(400).json({
                    error: 'Email & password do not match!'
                })
            }

            // generate token and send to client
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' })
            res.cookie('token', token, { expiresIn: 'id' })            
            const { _id, name, email, username, role } = user
            return res.json({
                token,
                user: { _id, name, email, username, role }
            })
        })
}

exports.logout = (req, res) => {
    res.clearCookie('token')
    res.json({
        message: 'Logout success!'
    })
}


exports.forgotPassword = (req, res) => {
    const { email } = req.body
    Auth.findOne({ email })
        .exec((err, user) => {
            if (err || !user) {
                return res.status(400).json({
                    error: 'User with that email does not exist!'
                })
            }
            const token = jwt.sign({ _id: user._id }, process.env.JWT_RESET_PASSWORD, { expiresIn: '10m' })

            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: email,
                subject: 'Password reset link',
                html: `
                    <p>Please use the following link to reset your password</p>
                    <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
                    <hr/>
                    <p>This email may contain sensitive information</p>
                `
            }

            return user.updateOne({ resetPasswordLink: token })
                .exec((err, success) => {
                    if (err) {
                        return res.json({error: errorHandler(err)})
                    } else {
                        transporter.sendMail(mailOptions, function () {
                            return res.json({
                                message: `Eamil has been sent to ${email} Follow this instruction to reset your password.`
                            })
                        })
                    }

                }) 
            
        })
}


exports.resetPassword = (req, res) => {
    const { resetPasswordLink, newPassword } = req.body
    if (resetPasswordLink) {
        jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function (err, docoded) {
            if (err) {
                return res.status(401).json({
                    error: 'Expired link. Try again!'
                })
            }

            Auth.findOne({ resetPasswordLink }, ((err, user) => {
                if (err || !user) {
                    return res.status(401).json({
                        error: 'Something went wrong. Try again!'
                    })
                }
                const updateFields = {
                    password: newPassword,
                    resetPasswordLink: ''
                }

                user = _.extend(user, updateFields)
                user.save((err, result) => {
                    if (err) {
                        return res.status(401).json({
                            error: errorHandler(err)
                        })
                    }
                    res.json({
                        message: 'Great! now you can login with your new password!'
                    })
                })

            }))
        })
    }
}

exports.requireLogin = expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256']
})




// test ========
exports.test = (req, res) => {
    res.json('it works')
}
