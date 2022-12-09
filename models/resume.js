// Load required packages
var mongoose = require('mongoose');

// Define our user schema
var ResumeSchema = new mongoose.Schema({
    userId: { // Referenced w/ uploader User
        type: String,
        required: true
    },
    documentURL: { // Placeholder until we settle on a format
        type: String, // Potentially accessed by URL
        required: true
    },
    documentName: {
        type: String,
        required: true
    },
    anonymity: {
        type: Boolean,
        default: false
    },
    tags: {
        type: [String],
    },
    commentIds: { // Referenced w/ attached Comments
        type: [String]
    },  
    dateCreated: {
        type: Date,
        default: Date.now
    }
});

// Export the Mongoose model
module.exports = mongoose.model('Resume', ResumeSchema);
