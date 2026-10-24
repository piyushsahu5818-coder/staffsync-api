const Training = require("../models/Training");

exports.list = async (req, res) =>
  res.json(await Training.find().populate("createdBy", "name").populate("participants", "name").sort("startDate"));

exports.create = async (req, res) => {
  const { title, description, startDate, endDate } = req.body;
  if (!title || !startDate || !endDate) return res.status(400).json({ message: "Title, start date and end date are required" });
  if (new Date(endDate) < new Date(startDate)) return res.status(400).json({ message: "End date cannot be before start date" });
  res.status(201).json(await Training.create({ title, description, startDate, endDate, createdBy: req.user._id }));
};

exports.enroll = async (req, res) => {
  const t = await Training.findById(req.params.id);
  if (!t) return res.status(404).json({ message: "Program not found" });
  if (t.participants.some((p) => String(p) === String(req.user._id))) return res.status(400).json({ message: "You are already enrolled" });
  t.participants.push(req.user._id);
  await t.save();
  res.json(t);
};

exports.leave = async (req, res) => {
  const t = await Training.findById(req.params.id);
  if (!t) return res.status(404).json({ message: "Program not found" });
  t.participants = t.participants.filter((p) => String(p) !== String(req.user._id));
  await t.save();
  res.json(t);
};

exports.remove = async (req, res) => {
  const t = await Training.findById(req.params.id);
  if (!t) return res.status(404).json({ message: "Program not found" });
  if (req.user.role !== "hr" && String(t.createdBy) !== String(req.user._id)) return res.status(403).json({ message: "Only the creator can delete this" });
  await t.deleteOne();
  res.json({ message: "Program deleted" });
};
