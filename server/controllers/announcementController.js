const Announcement = require("../models/Announcement");

exports.list = async (req, res) => res.json(await Announcement.find().populate("postedBy", "name").sort("-createdAt"));

exports.create = async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) return res.status(400).json({ message: "Title and body are required" });
  res.status(201).json(await Announcement.create({ title, body, postedBy: req.user._id }));
};

exports.remove = async (req, res) => {
  const a = await Announcement.findByIdAndDelete(req.params.id);
  if (!a) return res.status(404).json({ message: "Announcement not found" });
  res.json({ message: "Announcement deleted" });
};
