const multer=require("multer");
module.exports=multer({storage:multer.memoryStorage(),limits:{fileSize:8*1024*1024},fileFilter:(_req,file,done)=>file.mimetype.startsWith("image/")?done(null,true):done(new Error("Chỉ chấp nhận tệp hình ảnh"))});
