const router=require("express").Router(),controller=require("../controllers/artistController");router.get("/",controller.list);router.get("/:slug",controller.get);module.exports=router;
