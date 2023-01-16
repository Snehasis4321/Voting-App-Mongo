const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VotesSchema = new Schema({
  party: {
    type: Schema.Types.ObjectId,
    ref: "Parties",
    required: true,
  },

  voters: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Votes", VotesSchema);
