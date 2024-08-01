const clearCache = function (req, res, next) {
  res.header("Cache-control", "private, no-cache, no-store, must-revalidate");
  res.header("Expires", "-1");
  res.header("Pragma", "no-cache");
  next();
};

module.exports = clearCache;