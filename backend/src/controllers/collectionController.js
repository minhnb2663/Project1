const mongoose = require("mongoose");
const Favorite = require("../model/Favorite");
const Painting = require("../model/Painting");
const Analytics = require("../model/Analytics");

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const assertValidPaintingId = (paintingId) => {
  if (!mongoose.isValidObjectId(paintingId)) {
    throw createError("Mã tác phẩm không hợp lệ", 400);
  }
};

// GET /api/collections
exports.list = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate({
        path: "painting",
        populate: { path: "category" },
      })
      .sort({ createdAt: -1 });

    const data = favorites
      .map((favorite) => favorite.painting)
      .filter(Boolean);

    return res.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/collections/:paintingId
// Chỉ thêm, không toggle. Gọi nhiều lần vẫn giữ trạng thái "đã lưu".
exports.add = async (req, res, next) => {
  try {
    const { paintingId } = req.params;
    assertValidPaintingId(paintingId);

    const painting = await Painting.findById(paintingId).populate("category");
    if (!painting) throw createError("Không tìm thấy tác phẩm", 404);

    const key = { user: req.user._id, painting: paintingId };
    const existing = await Favorite.findOne(key);

    if (existing) {
      return res.json({
        success: true,
        favorited: true,
        alreadySaved: true,
        data: painting,
      });
    }

    await Favorite.create(key);

    const updatedPainting = await Painting.findByIdAndUpdate(
      paintingId,
      { $inc: { favoriteCount: 1, popularityScore: 2 } },
      { new: true },
    ).populate("category");

    // Analytics không nên làm hỏng thao tác lưu nếu log thất bại.
    Analytics.create({
      type: "favorite",
      user: req.user._id,
      meta: { painting: paintingId },
    }).catch(() => null);

    return res.status(201).json({
      success: true,
      favorited: true,
      alreadySaved: false,
      data: updatedPainting,
    });
  } catch (error) {
    // Nếu Favorite có unique index { user, painting }, double click có thể race.
    // E11000 được coi là thao tác add đã thành công.
    if (error?.code === 11000) {
      return res.json({
        success: true,
        favorited: true,
        alreadySaved: true,
      });
    }
    next(error);
  }
};

// DELETE /api/collections/:paintingId
exports.remove = async (req, res, next) => {
  try {
    const { paintingId } = req.params;
    assertValidPaintingId(paintingId);

    const removed = await Favorite.findOneAndDelete({
      user: req.user._id,
      painting: paintingId,
    });

    if (removed) {
      await Painting.findOneAndUpdate(
        { _id: paintingId, favoriteCount: { $gt: 0 } },
        { $inc: { favoriteCount: -1, popularityScore: -2 } },
      );
    }

    return res.json({
      success: true,
      favorited: false,
      removed: Boolean(removed),
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/collections
exports.clear = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id }).select("painting");

    const paintingIds = [
      ...new Set(
        favorites
          .map((favorite) => favorite.painting?.toString())
          .filter(Boolean),
      ),
    ];

    if (favorites.length) {
      await Favorite.deleteMany({ user: req.user._id });
    }

    if (paintingIds.length) {
      await Painting.updateMany(
        { _id: { $in: paintingIds }, favoriteCount: { $gt: 0 } },
        { $inc: { favoriteCount: -1, popularityScore: -2 } },
      );
    }

    return res.json({
      success: true,
      data: [],
      count: 0,
      removedCount: favorites.length,
    });
  } catch (error) {
    next(error);
  }
};
