const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const Comment = require("../models/comment.js");
const Resume = require("../models/resume.js");

const multer = require("multer");
const upload = multer(); // NOTE: To get buffer data, do not specify a destination

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
    const resumes = await Resume.find(where, select, cursor);
    if (count == true) {
      res.status(200).json({ message: "OK", data: resumes.length });
    } else {
      res.status(200).json({ message: "OK", data: resumes });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET by id: Display PDF on browser (for iframes)
router.get("/pdf/:id", (req, res) => {
  Resume.findById(req.params.id)
    .then((resume) => {
      if (!resume) {
        return res.status(404).json({
          message: "PDF not found",
        });
      }
      res.set("Content-Type", "application/pdf");
      res.send(resume.PDFdata);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

// GET by ID
router.get("/:id", getResume, (req, res) => {
  res.status(200).json({ message: "OK", data: res.resume });
});

// POST new resume
router.post("/", upload.single("pdf"), async (req, res) => {
  let currUser = await User.find({ firebaseId: req.userId });
  if (currUser == null) {
    console.log(req.body);
    console.log("Full req");
    console.log(req);
    return res.status(400).json({ message: "Parent User does not exist" });
  }

  const resume = new Resume({
    userId: req.body.userId,
    PDFdata: req.file.buffer,
    documentName: req.body.documentName,
    anonymity: req.body.anonymity,
    tags: req.body.tags,
    dateCreated: req.body.dateCreated,
  });

  try {
    const newResume = await resume.save();
    res.status(201).json({ message: "OK", data: newResume });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT replace details by ID
router.put("/:id", getResume, async (req, res) => {
  // Filters out any inputs fields that shouldn't be altered
  const updates = {
    documentName: req.body.documentName, // NOTE: Test to see if these are overwritten when no inputs given
    anonymity: req.body.anonymity,
    tags: req.body.tags,
  };

  try {
    await Resume.findByIdAndUpdate(req.params.id, updates).exec();
    res.status(200).json({ message: "OK", data: updates });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE by ID
// 2-way reference: Delete comments, update User's commentIds and resumeIds
router.delete("/:id", getResume, async (req, res) => {
  // Unassign resume itself and attached comments from User
  await Comment.deleteMany({ resumeId: req.id }).exec();

  try {
    await res.resume.remove();
    res.status(200).json({ message: "Deleted Resume", data: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// [Middleware] Retrieve Resume by ID & handle 404
async function getResume(req, res, next) {
  // Query String handling -> Should clean up as a helper func
  let { select } = req.query;
  // Parsing Select parameters
  if (select != null) {
    select = JSON.parse(select);
  }

  let resume;
  try {
    resume = await Resume.findById(req.params.id, select);
    if (resume == null) {
      return res.status(404).json({ message: "Resume not found" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.resume = resume;
  next();
}

module.exports = router;
