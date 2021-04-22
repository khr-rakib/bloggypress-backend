const Blog = require('../models/blogModel')
const Tag = require('../models/tagModel')
const Category = require('../models/categoryModel')
const User = require('../models/authModel')

const fs = require('fs')
const _ = require('lodash')
const slugify = require('slugify')
const formidable = require('formidable')
const { stripHtml } = require('string-strip-html')
const { smartTrim } = require('../helpers/blogHelper')
const { errorHandler } = require('../helpers/dbErrorHandle')


exports.create = (req, res) => {
    console.log(req.user)
    let form = new formidable.IncomingForm()
    form.keepExtensions = true
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Image could not upload'
            })
        }
        const { title, body, categories, tags } = fields
        if (!title || !title.length) {
            return res.status(400).json({
                error: 'Title is required'
            })
        }
        if (!body || body.length < 200) {
            return res.status(400).json({
                error: 'Content is too short'
            })
        }
        if (!categories || categories.length === 0) {
            return res.status(400).json({
                error: 'At least one category is required'
            })
        }
        if (!tags || tags.length === 0) {
            return res.status(400).json({
                error: 'At least one tag is required'
            })
        }

        let blog = new Blog()
        blog.title = title
        blog.body = body
        blog.excerpt = smartTrim(body, 320, ' ', ' ...')
        blog.slug = slugify(title).toLowerCase()
        blog.mtitle = `${title} | ${process.env.APP_NAME}`
        blog.mdesc = stripHtml(body.substring(0, 160)).result
        blog.postedBy = req.user._id
        // categories and tags
        let arrayOfTags = tags && tags.split(',')
        let arrayOfCategories = categories && categories.split(',')

        if (files.photo) {
            if (files.photo.size > 10000000) {
                return res.status(400).json({
                    error: 'Image size should be less then 1mb'
                })
            }
            blog.photo.data = fs.readFileSync(files.photo.path)
            blog.photo.contentType = files.photo.type
        }

        blog.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                })
            }

            Blog.findByIdAndUpdate(result._id, { $push: { categories: arrayOfCategories } }, { new: true }).exec((err, result) => {
                if (err) {
                    return res.status(400).json({
                        error: 'error with category'
                    })
                } else {
                    Blog.findByIdAndUpdate(result._id, { $push: { tags: arrayOfTags } }, { new: true }).exec((err, result) => {
                        if (err) {
                          return res.status(400).json({
                            error: 'error with tags'
                        })
                        } else {
                            res.json({
                                message: 'Blog post successfully'
                            })    
                        }
                    })
                }
            })
        })
    })
}