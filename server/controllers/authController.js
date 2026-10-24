const jwt = require("jsonwebtoken");
const User = require("../models/User");

const sign = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
const safe = (u) => {
  const o = u.toObject();
  delete o.passwordHash;
  return o;
};

// Self-registration. HR / manager sign-ups need REGISTRATION_CODE if one is set in the environment.
exports.register = async (req, res) => {
  const { name, email, password, department, role, code } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required" });
  if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
  const chosen = ["hr", "manager", "employee"].includes(role) ? role : "employee";
  if (chosen !== "employee" && process.env.REGISTRATION_CODE && code !== process.env.REGISTRATION_CODE)
    return res.status(403).json({ message: "Invalid registration code for this role" });
  const user = await User.create({ name, email, department: department || undefined, role: chosen, passwordHash: await User.hash(password) });
  res.status(201).json({ token: sign(user), user: safe(user) });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || "").toLowerCase() });
  if (!user || !(await user.matchPassword(password || "")))
    return res.status(401).json({ message: "Incorrect email or password" });
  res.json({ token: sign(user), user: safe(user) });
};

exports.me = (req, res) => res.json({ user: req.user });
