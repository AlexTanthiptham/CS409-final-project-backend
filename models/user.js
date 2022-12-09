// Load required packages
var mongoose = require('mongoose');

// Define our user schema
var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    fullname: {
        type: String,
        required: true
    },
    aboutme: {
        type: String,
        default: ""
    },
    resumeIds: { // Referenced w/ uploaded Resumes - empty by default
        type: [String]
    },
    commentIds: { // Referenced w/ posted Comments - empty by default
        type: [String]
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
});

// Export the Mongoose model
module.exports = mongoose.model('User', UserSchema);

