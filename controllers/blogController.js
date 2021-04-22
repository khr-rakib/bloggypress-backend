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

exports.list = (req, res) => {
    Blog.find({})
        .populate('categories', '_id name slug')
        .populate('tags', '_id name slug')
        .populate('postedBy', '_id name username')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('_id title slug body excerpt categories tags postedBy createdAt updatedAt')
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                })
            }
            res.json(data)
        })
}

exports.read = (req, res) => {
    const slug = req.params.slug
    Blog.findOne({ slug })
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                })
            }
            data.photo = undefined
            res.json(data)
        })
}

exports.remove = (req, res) => {
    const slug = req.params.slug
    Blog.findOneAndRemove({ slug })
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                })
            }
            res.json({
                message: 'Blog has been deleted.'
            })
        })
}

exports.update = (req, res) => {
    const slug = req.params.slug
    Blog.findOne({ slug })
        .exec((err, oldBlog) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                })
            }
            let form = new formidable.IncomingForm()
            form.keepExtensions = true
            form.parse(req, (err, fields, files) => {
                if (err) {
                    return res.status(400).json({
                        error: 'Image could not upload'
                    })
                }
                
                let slugBeforeMerge = oldBlog.slug
                oldBlog = _.merge(oldBlog, fields)
                oldBlog.slug = slugBeforeMerge

                const { body, categories, tags } = fields
                if (body) {
                    oldBlog.excerpt = smartTrim(body, 320, ' ', ' ...')
                    oldBlog.desc = stripHtml(body.substring(0, 160)).result
                }
                if (categories) {
                    oldBlog.categories = categories.split(',')
                }
                if (tags) {
                    oldBlog.tags = tags.split(',')
                }
                if (files.photo) {
                    if (files.photo.size > 1000000) {
                        return res.status(400).json({
                            error: 'Image size should be less then 1mb'
                        })
                    }
                    oldBlog.photo.data = fs.readFileSync(files.photo.path)
                    oldBlog.photo.contentType = files.photo.type
                }
                oldBlog.save((err, result) => {
                    if (err) {
                        return res.status(400).json({
                            error: errorHandler(err)
                        })
                    }
                    result.photo = undefined
                    res.json(result)
                })

            })
        })
}

exports.photo = (req, res) => {
    const slug = req.params.slug
    Blog.findOne({ slug })
        .select('photo')
        .exec((err, blog) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                })
            }
            res.set('Content-Type', blog.photo.contentType)
            return res.send(blog.photo.data)
        })
}

exports.listRelated = (req, res) => {
    let limit = req.query.limit ? parseInt(req.body.limit) : 3
    const { _id, categories } = req.body.blog
    Blog.find({ _id: { $ne: _id }, categories: { $ne: categories } })
        .limit(limit)
        .populate('postedBy', '_id name username profile')
        .select('title slug excerpt postedBy createdAt updatedAt')
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                })
            }
            res.json(data)
        })
}

exports.listSearch = (req, res) => {
    // const { search } = req.query
    // if (search) {
    //     Blog.find({
    //         $or: [
    //             { title: { $regex: search, $options: 'i' } },
    //             { body: { $regex: search, $options: 'i' } }
    //         ]
    //     }).exec((err, blogs) => {
    //         if (err) {
    //             return res.status(400).json({
    //                 error: errorHandler(err)
    //             })
    //         }
    //         blogs.photo = undefined
    //         blogs.body = undefined
    //         res.json(blogs)
    //     })
    // }
}