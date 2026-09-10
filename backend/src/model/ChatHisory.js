// models/ChatHistory.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ["user", "bot"],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  relatedPaintings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Painting" }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const chatHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionId: {
      type: String,
      required: true, // Nhóm các đoạn chat theo phiên
    },
    messages: [messageSchema],
  },
  { timestamps: true },
);

chatHistorySchema.index({ user: 1, sessionId: 1 });

module.exports = mongoose.model("ChatHistory", chatHistorySchema);
