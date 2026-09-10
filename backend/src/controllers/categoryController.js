const Category = require("../model/Category"),
  Painting = require("../model/Painting");
exports.list = async (_q, res, n) => {
  try {
    res.json({ success: true, data: await Category.find().sort("name") });
  } catch (e) {
    n(e);
  }
};
exports.create = async (q, res, n) => {
  try {
    res
      .status(201)
      .json({ success: true, data: await Category.create(q.body) });
  } catch (e) {
    n(e);
  }
};
exports.update = async (q, res, n) => {
  try {
    const x = await Category.findByIdAndUpdate(q.params.id, q.body, {
      new: true,
      runValidators: true,
    });
    if (!x) {
      const e = new Error("Không tìm thấy danh mục");
      e.statusCode = 404;
      throw e;
    }
    res.json({ success: true, data: x });
  } catch (e) {
    n(e);
  }
};
exports.remove = async (q, res, n) => {
  try {
    if (await Painting.exists({ category: q.params.id })) {
      const e = new Error("Danh mục đang được sử dụng");
      e.statusCode = 409;
      throw e;
    }
    await Category.findByIdAndDelete(q.params.id);
    res.status(204).end();
  } catch (e) {
    n(e);
  }
};

