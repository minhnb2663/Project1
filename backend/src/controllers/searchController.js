const service = require("../services/searchService"),
  Analytics = require("../model/Analytics");
exports.search = async (q, res, n) => {
  try {
    const query = q.query.q || q.body.query || "";
    if (!query.trim()) {
      const e = new Error("Vui lòng nhập nội dung tìm kiếm");
      e.statusCode = 400;
      throw e;
    }
    const intent = service.parse(query),
      data = await service.search(query);
    await Analytics.create({
      type: "search",
      user: q.user?._id,
      meta: { query, intent },
    });
    res.json({ success: true, query, intent, data });
  } catch (e) {
    n(e);
  }
};

