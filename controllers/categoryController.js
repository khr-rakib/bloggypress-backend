const Category = require('../models/categoryModel')
const slugify = require('slugify')
const formidable = require('formidable')
const fs = require('fs')
const _ = require('lodash')

exports.create = (req, res) => {
    let form = new formidable.IncomingForm()
    form.keepExtensions = true
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: "Image could not upload!"
            })
        }
        const { name } = fields
        if (!name || !name.length) {
            return res.status(400).json({
                error: "Category name is required!"
            })
        }
        const slug = slugify(name).toLowerCase()
        let category = new Category()
        category.name = name
        category.slug = slug

        if (files.photo) {
            if (files.photo.size > 10000000) {
                return res.json({
                    error: 'Image should be less then 1mb in size'
                })
            }
            category.photo.data = fs.readFileSync(files.photo.path)
            category.photo.contentType = files.photo.type
        }

        category.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(result)
        })
    })
}

exports.read = (req, res) => {
    const slug = req.params.slug.toLowerCase()
    Category.findOne({ slug })
        .exec((err, category) => {
            if (err) {
                return res.status(400).json({
                    error: 'Something went wrong'
                })
            }
            category.photo = undefined
            return res.json(category)
        })
    
}

exports.list = (req, res) => {
    Category.find({})
        .select('_id name slug')
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: 'Something went wrong'
                })
            }
            res.json(data)
        })
}

exports.update = (req, res) => {
    const slug = req.params.slug.toLowerCase()
    Category.findOne({ slug })
        .exec((err, oldCat) => {
            if (err) {
                return res.status(400).json({
                    error: "Somethign went wrong"
                })
            }
            let form = formidable.IncomingForm()
            form.keepExtensions = true
            form.parse(req, (err, fields, files) => {
                if (err) {
                    return res.status(400).json({
                        error: 'Image could not upload'
                    })
                }
                let slugBeforeMerge = oldCat.slug
                oldCat = _.merge(oldCat, fields)
                oldCat.slug = slugBeforeMerge

                if (files.photo) {
                    if (files.photo.size > 10000000) {
                        return res.status(400).json({
                            error: 'Image size could not less than 1mb in size'
                        })
                    }
                    oldCat.photo.data = fs.readFileSync(files.photo.path)
                    oldCat.photo.contentType = files.photo.type
                }

                oldCat.save((err, result) => {
                    if (err) {
                        return res.status(400).json({
                            error: "Something went wrong"
                        })
                    }
                    result.photo = undefined
                    return res.json(result)
                })
            })
        })
}


exports.remove = (req, res) => {
    const slug = req.params.slug.toLowerCase()
    Category.findOneAndRemove({ slug })
        .exec((err, success) => {
            if (err) {
                return res.status(400).json({
                    error: "Can't delete this category!"
                })
            }
            return res.json({
                message: "Category deleted successfully!"
            })
        })
}
