const r = require("express").Router(),
  c = require("../controllers/paintingController"),
  a = require("../middleware/authMiddleware"),
  upload = require("../middleware/paintingUploadMiddleware");
r.get("/", c.list);
r.get("/:id/download", c.download);
r.get("/:id", a.optionalAuth, c.get);
r.post("/", a.protect, a.adminOnly, upload.single("image"), c.create);
r.patch("/:id", a.protect, a.adminOnly, upload.single("image"), c.update);
r.delete("/:id", a.protect, a.adminOnly, c.remove);
r.post("/:id/favorite", a.protect, c.favorite);
module.exports = r;
