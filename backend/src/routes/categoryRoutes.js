const r = require("express").Router(),
  c = require("../controllers/categoryController"),
  a = require("../middleware/authMiddleware");
r.get("/", c.list);
r.post("/", a.protect, a.adminOnly, c.create);
r.patch("/:id", a.protect, a.adminOnly, c.update);
r.delete("/:id", a.protect, a.adminOnly, c.remove);
module.exports = r;
