const Analytics = require("../model/Analytics"),
  Painting = require("../model/Painting");
exports.summary = async (q, res, n) => {
  try {
    const days = Math.min(+q.query.days || 30, 365),
      since = new Date(Date.now() - days * 86400000);
    const [events, types, trending, searches] = await Promise.all([
      Analytics.countDocuments({ createdAt: { $gte: since } }),
      Analytics.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]),
      Painting.find()
        .sort("-popularityScore -viewCount")
        .limit(10)
        .select("title artist viewCount favoriteCount popularityScore"),
      Analytics.aggregate([
        { $match: { type: "search", createdAt: { $gte: since } } },
        { $group: { _id: "$meta.query", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);
    res.json({
      success: true,
      data: {
        periodDays: days,
        totalEvents: events,
        eventsByType: types,
        trendingPaintings: trending,
        popularSearches: searches,
      },
    });
  } catch (e) {
    n(e);
  }
};

