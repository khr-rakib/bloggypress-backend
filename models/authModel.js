const mongoose = require('mongoose')
const crypto = require('crypto')

const authSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            max: 32,
            trim: true,
            required: true
        },
        email: {
            type: String,
            trim: true,
            required: true,
            unique: true,
            lowercase: true
        },
        username: {
            type: String,
            trim: true,
            required: true,
            max: 32,
            unique: true,
            index: true,
            lowercase: true
        },
        profile: {
            type: String,
            required: true
        },
        hashed_password: {
            type: String,
            required: true
        },
        salt: String,
        about: String,
        role: {
            type: Number,
            default: 0
        },
        photo: {
            data: Buffer,
            contentType: String,
        },
        resetPasswordLink: {
            data: String,
            default: ''
        }
    },
    { timestamps: true }
)

authSchema.virtual('password')
    .set(function (password) {
        this._password = password
        this.salt = this.makeSalt()
        this.hashed_password = this.encryptPassword(password)
    })
    .get(function () {
        return this._password
    })

authSchema.methods = {
    authenticate: function (plainText) {
        return this.encryptPassword(plainText) == this.hashed_password
    },
    makeSalt: function () {
        return Math.round(new Date().valueOf() * Math.random()) + ''
    },
    encryptPassword: function (password) {
        if (!password) return ''
        try {
            return crypto.createHmac('sha1', this.salt)
                .update(password)
                .digest('hex')
        } catch (error) {
            return ''
        }
    }
}


module.exports = mongoose.model('Auth', authSchema)