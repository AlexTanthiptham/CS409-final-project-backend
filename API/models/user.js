// Load required packages
var mongoose = require("mongoose");

// Define our user schema
var UserSchema = new mongoose.Schema({
  firebaseId: {
    // Can't be editted after POST
    type: String,
    required: true,
  },
  email: {
    // Can't be editted after POST
    type: String,
    required: true,
  },
  username: {
    type: String,
    default: "Anonymous",
  },
  aboutme: {
    type: String,
    default: "",
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

// Export the Mongoose model
module.exports = mongoose.model("User", UserSchema);
