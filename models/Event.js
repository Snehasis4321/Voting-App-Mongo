const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  start: {
    type: Boolean,
    required: true,
  },
  end: {
    type: Boolean,
    required: true,
  },
});

module.exports = mongoose.model("Event", eventSchema);
