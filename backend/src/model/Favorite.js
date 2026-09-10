// models/Favorite.js
const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    painting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Painting",
      required: true,
    },
  },
  { timestamps: true },
);

// Đảm bảo 1 user không favorite trùng 1 tranh
favoriteSchema.index({ user: 1, painting: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);
