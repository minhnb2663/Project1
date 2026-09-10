const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  painting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Painting",
    required: true,
  },
  viewedAt: { type: Date, default: Date.now },
});
schema.index({ user: 1, painting: 1 }, { unique: true });
module.exports = mongoose.model("ViewHistory", schema);
