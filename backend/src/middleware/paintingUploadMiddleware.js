const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const uploadDir = path.join(__dirname, "../../uploads/paintings");
fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, done) => done(null, uploadDir),
  filename: (_req, file, done) => done(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${path.extname(file.originalname).toLowerCase()}`),
});
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
module.exports = multer({storage,limits:{fileSize:8*1024*1024},fileFilter:(_req,file,done)=>allowedTypes.has(file.mimetype)?done(null,true):done(new Error("Chỉ chấp nhận ảnh JPG, PNG, WEBP hoặc GIF"))});
