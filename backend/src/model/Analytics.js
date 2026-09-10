// models/Analytics.js
const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["view", "search", "favorite", "chat", "upload"],
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  meta: {
    type: mongoose.Schema.Types.Mixed, // Lưu linh hoạt: từ khóa tìm kiếm, painting id, category...
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

analyticsSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model("Analytics", analyticsSchema);
