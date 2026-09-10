module.exports = (err, _req, res, _next) => {
  console.error(err);
  const status = err.statusCode || (err.name === "ValidationError" ? 400 : 500);
  res.status(status).json({ success: false, message: status === 500 ? "Há»‡ thá»‘ng Ä‘ang gáº·p sá»± cá»‘, vui lĂ²ng thá»­ láº¡i" : err.message });
};

