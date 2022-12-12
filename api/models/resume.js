// Load required packages
var mongoose = require("mongoose");

// Define our user schema

var ResumeSchema = new mongoose.Schema({
  firebaseId: {
    // Referenced w/ uploader User
    type: String,
    required: true,
  },
  PDFdata: {
    type: Buffer,
    required: true,
  },
  documentName: {
    type: String,
    required: true,
  },
  anonymity: {
    type: Boolean,
    default: false,
  },
  tags: {
    type: [String],
    default: [""],
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

// Export the Mongoose model
module.exports = mongoose.model("Resume", ResumeSchema);
