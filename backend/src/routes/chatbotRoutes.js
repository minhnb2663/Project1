const router = require("express").Router();
const controller = require("../controllers/chatbotController");
const { protect } = require("../middleware/authMiddleware");
router.use(protect);
router.post("/", controller.chat);
router.get("/history", controller.history);
module.exports = router;
