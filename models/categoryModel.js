const mongoose = require('mongoose')

const categoryModel = new mongoose.Schema(
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
        },
        photo: {
            data: Buffer,
            contentType: String
        }
    },
    { timestamps: true }
)

module.exports = mongoose.model('Category', categoryModel)