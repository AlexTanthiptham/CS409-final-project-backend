const express = require('express')
const router = express.Router()
const Template = require('../models/template.js')

// GET all or a given query string
router.get('/', async (req, res) => {
    // Query String handling -> TODO: clean up as a helper func
    let {where, sort, select, skip, limit, count} = req.query
    // Parsing Search parameters
    if (where != null) {
        where = JSON.parse(where)
    }
    // Parsing Cursor parameters
    if (sort != null) {
        sort = JSON.parse(sort)
    }
    // Parsing Select parameters
    if (select != null) {
        select = JSON.parse(select)
    }
    const cursor = {
        limit,
        skip,
        sort
    }
    // Parsing Count condition
    if (count != null) {
        count = (count == 'true')
    }

    try {
        const templates = await Template.find(where, select, cursor)
        if (count == true) {
            res.status(200).json({ message: "OK", data: templates.length})
        } else {
            res.status(200).json({ message: "OK", data: templates})
        }
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// GET by ID - Retrieves URL of template
router.get('/:id', getTemplate, (req, res) => {
    const id = new mongodb.ObjectId(req.params.id);

    res.status(200).json({ message: "OK", data: res.templates})
})

// POST new template
router.post('/', async (req, res) => {
    // NOTE: Blocking duplicate template names - remove if not needed
    if (req.body.documentName != null){
        let checkDuplicate = await Template.find({email: req.body.documentName})
        if (checkDuplicate.length != 0) {
            return res.status(400).json({ message: 'Template with requested name already exists'})
        }
    }

    const template = new Template({
        documentName: req.body.documentName,
        PDFdata: req.body.PDFdata,
        tags: req.body.tags
    })

    try {
        const newTemplate = await template.save()
        res.status(201).json({ message: "OK", data: newTemplate})
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


// PUT replace details by ID
router.put('/:id', getTemplate, async (req, res) => {
    // NOTE: Blocking duplicate template names - remove if not needed
    let duplicate = await Template.find({ documentName: req.body.documentName, _id: {$ne : res.user._id} })
    if (duplicate.length != 0) {
        return res.status(400).json({ message: 'Template with requested name already exists'})
    }

    // Filters out any inputs fields that shouldn't be altered
    const updates = {
        documentName: req.body.documentName,
        tags: req.body.tags
    }

    // Replace all other details
    try {
        await Template.findByIdAndUpdate(req.params.id, updates).exec()
        res.status(200).json({ message: "OK", data: updates})
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}) 

// DELETE by ID
router.delete('/:id', getTemplate, async (req, res) => {
    try {
        await Template.remove({_id: req.params.id})
        res.status(200).json({ message: 'Deleted Template', data: req.params.id})
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// [Middleware] Handle server errors
router.use((err, req, res, next) => {
    // Handle MongoDB & querying errors
    if (err instanceof mongodb.MongoError) {
        res.status(500).json({ message: err.message })
    } else if (err instanceof mongodb.GridFSBucket.FileNotFoundError) {
        res.status(404).json({ message: 'Template not found'})
    } else {
        res.status(500).json({ message: err.message })
    }
})


async function getTemplate(req, res, next) {
    // Query String handling -> Should clean up as a helper func
    let {select} = req.query
    // Parsing Select parameters
    if (select != null) {
        select = JSON.parse(select)
    }
    let template
    try {
        template = await Template.findById(req.params.id, select)
        if (template == null) {
            return res.status(404).json({ message: 'Template not found'})
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
    res.template = template
    next()
}

module.exports = router