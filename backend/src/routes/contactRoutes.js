const router=require("express").Router(),controller=require("../controllers/contactController"),auth=require("../middleware/authMiddleware");
router.post("/",controller.create);router.get("/",auth.protect,auth.adminOnly,controller.list);router.patch("/:id",auth.protect,auth.adminOnly,controller.update);module.exports=router;
