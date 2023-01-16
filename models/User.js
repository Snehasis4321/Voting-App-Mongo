// User Schema

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  aadhar: {
    type: Number,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  date_of_birth: {
    type: Date,
    required: true,
  },
  isVoted: {
    type: Boolean,
    required: false,
  },
});

module.exports = mongoose.model("User", UserSchema);
