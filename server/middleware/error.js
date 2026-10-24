exports.notFound = (req, res) => res.status(404).json({ message: "Route not found" });
exports.errorHandler = (err, req, res, next) => {
  console.error(err);
  if (err.name === "ValidationError")
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(", ") });
  if (err.code === 11000)
    return res.status(409).json({ message: "Duplicate value: " + Object.keys(err.keyValue).join(", ") });
  if (err.name === "CastError") return res.status(400).json({ message: "Invalid id" });
  res.status(err.status || 500).json({ message: err.message || "Server error" });
};
// wraps async handlers so errors reach errorHandler
exports.wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
