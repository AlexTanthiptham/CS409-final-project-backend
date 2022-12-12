const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const Comment = require("../models/comment.js");
const Resume = require("../models/resume.js");

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
    const users = await User.find(where, select, cursor);
    if (count == true) {
      res.status(200).json({ message: "OK", data: users.length });
    } else {
      res.status(200).json({ message: "OK", data: users });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET by ID
router.get("/:id", getUser, (req, res) => {
  res.status(200).json({ message: "OK", data: res.user });
});

// POST new user
// Takes only firebaseId, email and username
router.post("/", async (req, res) => {
  // Check validity of new username & email
  console.log(req.body);
  let checkDuplicate = await User.find({ firebaseId: req.body.firebaseId });
  if (checkDuplicate.length != 0) {
    return res
      .status(400)
      .json({ message: "User with requested firebaseId already exists" });
  }

  checkDuplicate = await User.find({ email: req.body.email });
  if (checkDuplicate.length != 0) {
    return res
      .status(400)
      .json({ message: "User with requested email already exists" });
  }

  const user = new User({
    firebaseId: req.body.firebaseId,
    email: req.body.email,
    username: req.body.username,
    dateCreated: req.body.dateCreated,
  });

  try {
    const newUser = await user.save();
    res.status(201).json({ message: "OK", data: newUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT replace details by ID
// Can only edit username, aboutme
router.put("/:id", async (req, res) => {
  // NOTE: Until end of put request; res = old data , req = new data

  // Filters out any inputs fields that shouldn't be altered
  const updates = {
    username: req.body.username,
    aboutme: req.body.aboutme,
  };

  try {
    await User.findByIdAndUpdate(req.params.id, updates).exec();
    res.status(200).json({ message: "OK", data: updates });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE by ID
// 2-way reference: Delete resumes and comments
router.delete("/:id", getUser, async (req, res) => {
  // Delete all linked resumes and comments
  await Comment.deleteMany({ where: { firebaseId: res.firebaseId } }).exec();
  await Resume.deleteMany({ where: { firebaseId: res.firebaseId } }).exec();

  try {
    await res.user.remove();
    res.status(200).json({ message: "Deleted User", data: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// [Middleware] Retrieve User by ID & handle 404
async function getUser(req, res, next) {
  // Query String handling
  let { select } = req.query;
  // Parsing Select parameters
  if (select != null) {
    select = JSON.parse(select);
  }

  let user;
  try {
    user = await User.findById(req.params.id, select);
    if (user == null) {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.user = user;
  next();
}

module.exports = router;
