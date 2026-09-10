const router = require("express").Router();
const collectionController = require("../controllers/collectionController");
const { protect } = require("../middleware/authMiddleware");

// Toàn bộ collection là dữ liệu riêng của user đăng nhập.
router.use(protect);

router.get("/", collectionController.list);
router.post("/:paintingId", collectionController.add);
router.delete("/", collectionController.clear);
router.delete("/:paintingId", collectionController.remove);

module.exports = router;
