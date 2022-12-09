const express = require('express')
const router = express.Router()
const User = require('../models/user.js')
const Comment = require('../models/comment.js')
const Resume = require('../models/resume.js')

// NOTE: Keep relevant schema open when working

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
        const comments = await Comment.find(where, select, cursor)
        if (count == true) {
            res.status(200).json({ message: "OK", data: comments.length})
        } else {
            res.status(200).json({ message: "OK", data: comments})
        }
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// GET by ID
router.get('/:id', getComment, (req, res) => {
    res.status(200).json({ message: "OK", data: res.comment})
})

// POST new comment
router.post('/', async (req, res) => {
    // Check if assignedUser - assignedUserName combination exists
    let currUser = await User.findById(req.body.userId)
    if (currUser == null) {
        return res.status(400).json({ message: 'Parent User does not exist'})
    }

    let currResume = await Resume.findById(req.body.userId)
    if (currResume == null) {
        return res.status(400).json({ message: 'Parent resume does not exist'})
    }

    const comment = new Comment({
        userId: req.body.userId,
        resumeId: req.body.resumeId,
        content: req.body.content,
        rating: req.body.rating,
        dateCreated: req.body.dateCreated
    })

    try {
        const newComment = await comment.save()

        console.log(newComment) // DEBUG - REMOVE BEFORE PRODUCTION
        
        // Successful Upload: Add commentId to the parent User & Resume
        currUser.commentIds.push(newComment._id)
        currResume.commentIds.push(newComment._id)

        try { // TODO - Compare w/ method in resumes.js to see if JSON variable is necessary
            await User.findByIdAndUpdate(currUser._id, currUser.commentIds).exec()
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
        try {
            await User.findByIdAndUpdate(currResume._id, currResume.commentIds).exec()
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }

        res.status(201).json({ message: "OK", data: newComment})
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


// PUT replace details by ID
// Alters all values except userId, resumeId and date
router.put('/:id', getComment, async (req, res) => {
    // NOTE: Until end of put request; res = old data , req = new data

    // Filters out any inputs fields that shouldn't be altered
    const updates = {
        content : req.body.content, // NOTE: Test to see if these are overwritten when no inputs given
        rating: req.body.rating
    }

    // Replace all other user details
    try {
        await Comment.findByIdAndUpdate(req.params.id, updates).exec()
        res.status(200).json({ message: "OK", data: updates})
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}) 

// DELETE by ID
// 2-way reference: Update parent User and Resume's commentIds and resumeIds
router.delete('/:id', getComment, async (req, res) => {
    let currUser = await User.findById(res.comment.userId)
    let currResume = await User.findById(res.resume.resumeId)


    if(currUser != null) {
        let removeIdx = currUser.commentIds.indexOf(req.params.id)
        if (removeIdx != -1) {
            currUser.commentIds.splice(removeIdx, 1)
        }
        removeIdx = currResume.commentIds.indexOf(req.params.id)
        if (removeIdx != -1) {
            currResume.commentIds.splice(removeIdx, 1)
        }

        try {
            await User.findByIdAndUpdate(currUser._id, currUser.commentIds).exec()
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
        try {
            await Resume.findByIdAndUpdate(currResume._id, currResume.commentIds).exec()
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }
    
    try {
        await res.comment.remove()
        res.status(200).json({ message: 'Deleted Comment', data: req.params.id})
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// [Middleware] Retrieve Comment by ID & handle 404
async function getComment(req, res, next) {

    // Query String handling -> Should clean up as a helper func
    let {select} = req.query
    // Parsing Select parameters
    if (select != null) {
        select = JSON.parse(select)
    }

    let comment
    try {
        comment = await Comment.findById(req.params.id, select)
        if (comment == null) {
            return res.status(404).json({ message: 'Comment not found'})
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
    res.comment = comment
    next()
}

module.exports = router