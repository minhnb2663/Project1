const r = require("express").Router(),
  c = require("../controllers/authController"),
  { protect, adminOnly } = require("../middleware/authMiddleware");
r.post("/register", c.register);
r.post("/login", c.login);
r.get("/me", protect, c.me);
r.patch("/me", protect, c.updateMe);
r.get("/users",protect,adminOnly,c.listUsers);
r.patch("/users/:id",protect,adminOnly,c.updateUser);
module.exports = r;
