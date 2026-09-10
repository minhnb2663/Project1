const s = require("../services/recommendationService"),
  Painting = require("../model/Painting");
exports.mine = async (q, res, n) => {
  try {
    let data = await s.forUser(q.user._id);
    if (!data.length)
      data = await Painting.find()
        .sort("-popularityScore")
        .limit(20)
        .populate("category");
    res.json({ success: true, data });
  } catch (e) {
    n(e);
  }
};
exports.similar = async (q, res, n) => {
  try {
    const p = await Painting.findById(q.params.id);
    if (!p) {
      const e = new Error("Không tìm thấy tác phẩm");
      e.statusCode = 404;
      throw e;
    }
    const data = await Painting.find({
      _id: { $ne: p._id },
      $or: [
        { category: p.category },
        { style: p.style },
        { dominantColors: { $in: p.dominantColors } },
        { tags: { $in: p.tags } },
      ],
    })
      .limit(12)
      .populate("category");
    res.json({ success: true, data });
  } catch (e) {
    n(e);
  }
};

