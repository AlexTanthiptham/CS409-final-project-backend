const express = require('express')
const router = express.Router()
const User = require('../models/user.js')
const Comment = require('../models/comment.js')
const Resume = require('../models/resume.js')

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
        const resumes = await Resume.find(where, select, cursor)
        if (count == true) {
            res.status(200).json({ message: "OK", data: resumes.length})
        } else {
            res.status(200).json({ message: "OK", data: resumes})
        }
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// GET by ID
router.get('/:id', getResume, (req, res) => {
    res.status(200).json({ message: "OK", data: res.resume})
})

// POST new resume
router.post('/', async (req, res) => {
    let currUser = await User.findById(req.body.userId)
    if (currUser == null) {
        return res.status(400).json({ message: 'Parent User does not exist'})
    }
    const resume = new Resume({
        userId: req.body.userId,
        documentURL: req.body.documentURL,
        documentName: req.body.documentName,
        anonymity: req.body.anonymity,
        tags: req.body.tags,
        dateCreated: req.body.dateCreated
    })

    try {
        const newResume = await resume.save()
        console.log(newResume) // DEBUG - REMOVE BEFORE PRODUCTION

        // Successful Upload: Add resumeId to the User variables's JSON 
        currUser.commentIds.push(newResume._id)

        const assign = { // TODO - Check if this is strictly necessary
            commentIds: currUser.commentIds
        }

        try {
            await User.findByIdAndUpdate(currUser._id, assign).exec()
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }

        res.status(201).json({ message: "OK", data: newResume})
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


// PUT replace details by ID
// Alters all values except for userId, commentIds, documentURL, date
router.put('/:id', getResume, async (req, res) => {
    // NOTE: Until end of put request; res = old data , req = new data

    // Filters out any inputs fields that shouldn't be altered
    const updates = {
        documentName : req.body.documentName, // NOTE: Test to see if these are overwritten when no inputs given
        anonymity: req.body.anonymity,
        tags: req.body.tags
    }

    try {
        await Resume.findByIdAndUpdate(req.params.id, updates).exec()
        res.status(200).json({ message: "OK", data: updates})
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}) 

// DELETE by ID
// 2-way reference: Delete comments, update User's commentIds and resumeIds
router.delete('/:id', getResume, async (req, res) => {
    // Unassign resume itself and attached comments from User
    let currUser = await User.findById(res.resume.userId)

    if(currUser != null) {
        let removeIdx = currUser.resumeIds.indexOf(req.params.id)
        if (removeIdx != -1) {
            currUser.resumeIds.splice(removeIdx, 1)
        }
        
        if (res.resume.commentIds != null) {
            res.resume.commentIds.forEach( async currComment => {
                // Remove comment from User
                removeIdx = currUser.commentIds.indexOf(currComment)
                if (removeIdx != -1) {
                    currUser.commentIds.splice(removeIdx, 1)
                }
                // Delete comment from database
                try {
                    await Comment.findByIdAndRemove(currComment).exec()
                    console.log(JSON.stringify({ message: 'Comment Deleted', data: currComment}))
                } catch (err) {
                    console.log({ message: err.message }) // Proceed with deletion even if error?
                }
            })
        }

        const unassign = {
            resumeIds: currUser.resumeIds,
            commentIds: currUser.commentIds
        }
        try {
            await User.findByIdAndUpdate(currUser._id, unassign).exec()
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }

    try {
        await res.resume.remove()
        res.status(200).json({ message: 'Deleted Resume', data: req.params.id})
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// [Middleware] Retrieve Resume by ID & handle 404
async function getResume(req, res, next) {

    // Query String handling -> Should clean up as a helper func
    let {select} = req.query
    // Parsing Select parameters
    if (select != null) {
        select = JSON.parse(select)
    }

    let resume
    try {
        resume = await Resume.findById(req.params.id, select)
        if (resume == null) {
            return res.status(404).json({ message: 'Resume not found'})
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
    res.resume = resume
    next()
}

module.exports = router