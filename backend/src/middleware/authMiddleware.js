const jwt = require("jsonwebtoken");
const User = require("../model/User");
exports.protect = async (req, _res, next) => {
  try {
    const token =
      req.headers.authorization?.startsWith("Bearer ") &&
      req.headers.authorization.slice(7);
    if (!token) {
      const e = new Error("Vui lòng đăng nhập để tiếp tục");
      e.statusCode = 401;
      throw e;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user?.isActive) {
      const e = new Error("Tài khoản hiện không khả dụng");
      e.statusCode = 401;
      throw e;
    }
    next();
  } catch (e) {
    e.statusCode ||= 401;
    next(e);
  }
};
exports.optionalAuth = async (req, _res, next) => {
  const token =
    req.headers.authorization?.startsWith("Bearer ") &&
    req.headers.authorization.slice(7);
  if (token)
    try {
      req.user = await User.findById(
        jwt.verify(token, process.env.JWT_SECRET).id,
      ).select("-password");
    } catch (_) {}
  next();
};
exports.adminOnly = (req, _res, next) => {
  if (req.user?.role !== "admin") {
    const e = new Error("Chức năng này chỉ dành cho quản trị viên");
    e.statusCode = 403;
    return next(e);
  }
  next();
};

