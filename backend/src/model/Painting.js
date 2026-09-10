// models/Painting.js
const mongoose = require("mongoose");

const paintingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    artist: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    aiSummary: {
      type: String, // Mô tả do AI tự sinh (OpenAI)
      default: "",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    tags: [{ type: String }], // AI-based tagging: ["blue", "modern", "abstract"]

    // Thuộc tính nghệ thuật
    style: {
      type: String,
      // Ví dụ: Abstract, Modern, Classical, Impressionism, Watercolor...
    },
    surfaceMaterial: {
      type: String,
      // Canvas, Paper, Wood, Wall...
    },
    colorMedium: {
      type: String,
      // Oil, Acrylic, Watercolor, Digital...
    },
    dominantColors: [{ type: String }], // Kết quả từ AI Image Recognition

    // Ảnh
    images: [
      {
        url: { type: String, required: true },
        isPrimary: { type: Boolean, default: false },
      },
    ],

    // Thống kê
    viewCount: {
      type: Number,
      default: 0,
    },
    favoriteCount: {
      type: Number,
      default: 0,
    },
    popularityScore: {
      type: Number,
      default: 0, // Dùng cho trending/recommendation
    },

    // Vector đơn giản để so sánh độ tương đồng (recommendation rule-based)
    embeddingTags: [{ type: String }], // Kết hợp category+style+color để match nhanh

    price: {
  type: Number,
  default: 0,
  min: 0,
},
    isAvailable: {
      type: Boolean,
      default: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

// Index hỗ trợ tìm kiếm nhanh
paintingSchema.index({ title: "text", description: "text", tags: "text" });
paintingSchema.index({ category: 1, style: 1 });

module.exports = mongoose.model("Painting", paintingSchema);
