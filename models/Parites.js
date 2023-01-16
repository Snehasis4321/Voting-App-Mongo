const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PartiesSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  leader: {
    type: String,
    required: true,
  },
  manifesto: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Parties", PartiesSchema);
