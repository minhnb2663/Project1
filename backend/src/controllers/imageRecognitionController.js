const vision = require("../services/visionService"),
  Painting = require("../model/Painting"),
  Analytics = require("../model/Analytics");
exports.recognize = async (q, res, n) => {
  try {
    if (!q.file) {
      const e = new Error("Vui lòng chọn hình ảnh");
      e.statusCode = 400;
      throw e;
    }
    const analysis = await vision.analyze(q.file.buffer);
    const similar = await Painting.find({
      $or: [
        { dominantColors: { $in: analysis.dominantColors } },
        { tags: { $in: analysis.tags } },
      ],
    })
      .limit(8)
      .populate("category");
    if (q.user)
      await Analytics.create({
        type: "upload",
        user: q.user._id,
        meta: analysis,
      });
    res.json({ success: true, analysis, similar });
  } catch (e) {
    n(e);
  }
};

