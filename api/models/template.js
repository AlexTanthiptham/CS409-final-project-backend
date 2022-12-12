// Load required packages
var mongoose = require("mongoose");

// Define our user schema
var TemplateSchema = new mongoose.Schema({
  documentName: {
    type: String,
    required: true,
  },
  PDFdata: {
    type: Buffer,
    required: true,
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
module.exports = mongoose.model("Template", TemplateSchema);
