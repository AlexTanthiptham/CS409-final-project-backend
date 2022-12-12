const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const Comment = require("../models/comment.js");
const Resume = require("../models/resume.js");

// NOTE: Keep relevant schema open when working

// GET all or a given query string
router.get("/", async (req, res) => {
  // Query String handling -> TODO: clean up as a helper func
  let { where, sort, select, skip, limit, count } = req.query;
  // Parsing Search parameters
  if (where != null) {
    where = JSON.parse(where);
  }
  // Parsing Cursor parameters
  if (sort != null) {
    sort = JSON.parse(sort);
  }
  // Parsing Select parameters
  if (select != null) {
    select = JSON.parse(select);
  }
  const cursor = {
    limit,
    skip,
    sort,
  };
  // Parsing Count condition
  if (count != null) {
    count = count == "true";
  }

  try {
    const comments = await Comment.find(where, select, cursor);
    if (count == true) {
      res.status(200).json({ message: "OK", data: comments.length });
    } else {
      res.status(200).json({ message: "OK", data: comments });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET by ID
router.get("/:id", getComment, (req, res) => {
  res.status(200).json({ message: "OK", data: res.comment });
});

// POST new comment or overwrite old comment
router.post("/", async (req, res) => {
  // Check if the requested resume exists
  let currResume = await Resume.findById(req.body.resumeId, { PDFdata: 0 });
  if (currResume == null) {
    return res.status(400).json({ message: "Parent resume does not exist" });
  }

  // Check if requested user exists and hasn't posted on the resume yet
  let currUser = await User.findOne({ firebaseId: req.body.firebaseId });
  if (currUser == null) {
    return res.status(400).json({ message: "Parent User does not exist" });
  }
  console.log("First validity checks done");
  // If User has already posted, overwrite old post
  let duplicate = await Comment.find({
    $and: [
      { firebaseId: req.body.firebaseId },
      { resumeId: req.body.resumeId },
    ],
  });
  console.log("Scan for duplicates: " + duplicate.length);
  console.log(duplicate);

  // Initial review, treat as POST request
  if (duplicate.length == 0) {
    console.log("No Duplicates");
    const comment = new Comment({
      firebaseId: req.body.firebaseId,
      resumeId: req.body.resumeId,
      content: req.body.content,
      rating: req.body.rating,
      dateCreated: req.body.dateCreated,
    });

    try {
      const newComment = await comment.save();
      res.status(201).json({ message: "OK", data: newComment });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
  // Subsequent review, treat as PUT request
  else if (duplicate.length == 1) {
    console.log("One Duplicate - Updating Post");
    console.log(duplicate[0]._id);
    const updates = {
      content: req.body.content, // NOTE: Test to see if these are overwritten when no inputs given
      rating: req.body.rating,
    };

    try {
      await Comment.findByIdAndUpdate(duplicate[0]._id, updates).exec();
      res.status(200).json({ message: "OK", data: updates });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {
    res
      .status(500)
      .json({ message: "Something has gone wrong - contact an admin" });
  }
});

// PUT replace details by ID
// Deprecated - unused outside of debug purposes
router.put("/:id", getComment, async (req, res) => {
  // NOTE: Until end of put request; res = old data , req = new data

  // Filters out any inputs fields that shouldn't be altered
  const updates = {
    content: req.body.content, // NOTE: Test to see if these are overwritten when no inputs given
    rating: req.body.rating,
  };

  // Replace all other user details
  try {
    await Comment.findByIdAndUpdate(req.params.id, updates).exec();
    res.status(200).json({ message: "OK", data: updates });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE by ID
// 2-way reference: Update parent User and Resume's commentIds and resumeIds
router.delete("/:id", getComment, async (req, res) => {
  try {
    await res.comment.remove();
    res.status(200).json({ message: "Deleted Comment", data: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// [Middleware] Retrieve Comment by ID & handle 404
async function getComment(req, res, next) {
  // Query String handling -> Should clean up as a helper func
  let { select } = req.query;
  // Parsing Select parameters
  if (select != null) {
    select = JSON.parse(select);
  }

  let comment;
  try {
    comment = await Comment.findById(req.params.id, select);
    if (comment == null) {
      return res.status(404).json({ message: "Comment not found" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.comment = comment;
  next();
}

module.exports = router;
