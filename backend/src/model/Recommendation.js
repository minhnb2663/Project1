// models/Recommendation.js
const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recommendedPaintings: [
      {
        painting: { type: mongoose.Schema.Types.ObjectId, ref: "Painting" },
        score: { type: Number, default: 0 }, // Điểm phù hợp (rule-based)
        reason: { type: String }, // "Cùng style", "Màu tương tự", "Trending"...
      },
    ],
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

recommendationSchema.index({ user: 1, generatedAt: -1 });

module.exports = mongoose.model("Recommendation", recommendationSchema);
