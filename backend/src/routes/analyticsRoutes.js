const r=require("express").Router(),c=require("../controllers/analyticsController"),a=require("../middleware/authMiddleware");r.get("/summary",a.protect,a.adminOnly,c.summary);module.exports=r;
