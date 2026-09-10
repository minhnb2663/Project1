const r=require("express").Router(),c=require("../controllers/orderController"),a=require("../middleware/authMiddleware");
r.post("/",a.protect,c.create);r.get("/mine",a.protect,c.mine);r.get("/",a.protect,a.adminOnly,c.list);r.patch("/:id/status",a.protect,a.adminOnly,c.updateStatus);
module.exports=r;
