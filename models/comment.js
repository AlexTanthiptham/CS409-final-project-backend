// Load required packages
var mongoose = require('mongoose');

// Define our user schema
var CommentSchema = new mongoose.Schema({
    userId: { // Referenced w/ posting User
        type: String,
        required: true
    },
    resumeId: { // Referenced w/ Resume it is located on
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    rating: {
        type: Number
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
});

// Export the Mongoose model
module.exports = mongoose.model('Comment', CommentSchema);
