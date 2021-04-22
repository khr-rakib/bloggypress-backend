const Tag = require('../models/tagModel')
const slugify = require('slugify')
const _ = require('lodash')
const { errorHandler } = require('../helpers/dbErrorHandle')

exports.create = (req, res) => {
    const { name } = req.body
    Tag.findOne({ name })
        .exec((err, data) => {
            if (err || data) {
                return res.status(400).json({
                    error: 'Already taken'
                })
            }
            let slug = slugify(name).toLowerCase()
            let tag = new Tag({ name, slug })
            tag.save((err, success) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    })
                }
                return res.json({
                    message: 'Tag create successfully!'
                })
            })
        })
}

exports.read = (req, res) => {
    const slug = req.params.slug.toLowerCase()
    Tag.findOne({ slug })
        .exec((err, tag) => {
            if (err) {
                return res.status(400).json({
                    error: 'Something went wrong'
                })
            }            
            return res.json(tag)
        })
    
}

exports.list = (req, res) => {
    Tag.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: 'Something went wrong'
                })
            }
            res.json(data)
        })
}



exports.remove = (req, res) => {
    const slug = req.params.slug.toLowerCase()
    Tag.findOneAndRemove({ slug })
        .exec((err, success) => {
            if (err) {
                return res.status(400).json({
                    error: "Can't delete this Tag!"
                })
            }
            return res.json({
                message: "Tag deleted successfully!"
            })
        })
}