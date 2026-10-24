const User = require("../models/User");

exports.list = async (req, res) => {
  const filter = req.user.role === "manager" ? { managerId: req.user._id } : {};
  const { q, department } = req.query;
  if (q) filter.$or = [{ name: new RegExp(q, "i") }, { email: new RegExp(q, "i") }];
  if (department) filter.department = department;
  const users = await User.find(filter).select("-passwordHash").populate("managerId", "name").sort("name");
  res.json(users);
};

exports.create = async (req, res) => {
  const { password, ...rest } = req.body;
  if (!password || password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
  if (!rest.managerId) delete rest.managerId;
  const user = await User.create({ ...rest, passwordHash: await User.hash(password) });
  const o = user.toObject();
  delete o.passwordHash;
  res.status(201).json(o);
};

const canView = (req, target) =>
  req.user.role === "hr" ||
  String(req.user._id) === String(target._id) ||
  (req.user.role === "manager" && String(target.managerId?._id || target.managerId) === String(req.user._id));

exports.getOne = async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash").populate("managerId", "name");
  if (!user) return res.status(404).json({ message: "Employee not found" });
  if (!canView(req, user)) return res.status(403).json({ message: "Forbidden" });
  res.json(user);
};

exports.update = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "Employee not found" });
  const isHR = req.user.role === "hr";
  if (!isHR && String(req.user._id) !== String(user._id)) return res.status(403).json({ message: "Forbidden" });

  // employees/managers may only edit their own personal details
  const allowed = isHR
    ? ["name", "email", "role", "department", "designation", "managerId", "phone", "address", "joiningDate", "leaveBalance"]
    : ["name", "phone", "address"];
  allowed.forEach((f) => {
    if (req.body[f] !== undefined) user[f] = req.body[f] === "" && f === "managerId" ? null : req.body[f];
  });
  if (req.body.password) {
    if (req.body.password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
    user.passwordHash = await User.hash(req.body.password);
  }
  await user.save();
  const o = user.toObject();
  delete o.passwordHash;
  res.json(o);
};

exports.remove = async (req, res) => {
  if (String(req.user._id) === req.params.id) return res.status(400).json({ message: "You cannot delete your own account" });
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "Employee not found" });
  res.json({ message: "Employee deleted" });
};
