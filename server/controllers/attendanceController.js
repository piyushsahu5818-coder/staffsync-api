const Attendance = require("../models/Attendance");

const today = () => new Date().toISOString().slice(0, 10);

exports.checkIn = async (req, res) => {
  const date = today();
  if (await Attendance.findOne({ employeeId: req.user._id, date }))
    return res.status(400).json({ message: "You already checked in today" });
  const now = new Date();
  const late = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30); // after 9:30 = late
  const rec = await Attendance.create({ employeeId: req.user._id, date, checkIn: now, status: late ? "late" : "present" });
  res.status(201).json(rec);
};

exports.checkOut = async (req, res) => {
  const rec = await Attendance.findOne({ employeeId: req.user._id, date: today() });
  if (!rec) return res.status(400).json({ message: "Check in first" });
  if (rec.checkOut) return res.status(400).json({ message: "You already checked out today" });
  rec.checkOut = new Date();
  if ((rec.checkOut - rec.checkIn) / 3600000 < 4) rec.status = "half-day";
  await rec.save();
  res.json(rec);
};

exports.mine = async (req, res) => {
  const records = await Attendance.find({ employeeId: req.user._id }).sort("-date").limit(60);
  res.json({ today: records.find((r) => r.date === today()) || null, records });
};

exports.all = async (req, res) => {
  const filter = {};
  if (req.query.date) filter.date = req.query.date;
  if (req.query.employeeId) filter.employeeId = req.query.employeeId;
  res.json(await Attendance.find(filter).populate("employeeId", "name department").sort("-date").limit(500));
};
