// Load required packages
var mongoose = require('mongoose');

// Define our user schema
var TemplateSchema = new mongoose.Schema({
    documentName: {
        type: String,
        required: true
    },
    documentURL: { // Placeholder until we settle on a format
        type: String,
        required: true
    },
    tags: {
        type: [String],
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
});

// Export the Mongoose model
module.exports = mongoose.model('Template', TemplateSchema);
