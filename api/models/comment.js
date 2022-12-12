// Load required packages
var mongoose = require("mongoose");

// Define our user schema
var CommentSchema = new mongoose.Schema({
  firebaseId: {
    // ID of parent user
    type: String,
    required: true,
  },
  resumeId: {
    // ID of parent resume
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  rating: {
    // TODO: Implement hard limits so rating is within 0-5
    type: Number,
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

// Export the Mongoose model
module.exports = mongoose.model("Comment", CommentSchema);
