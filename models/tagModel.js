const mongoose = require('mongoose')

const tagModel = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            max: 32
        },
        slug: {
            type: String,
            trim: true,
            required: true,
            index: true,
            unique: true
        }
    },
    { timestamps: true }
)

module.exports = mongoose.model('Tag', tagModel)