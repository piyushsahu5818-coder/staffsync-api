const Leave = require("../models/Leave");
const User = require("../models/User");

const dayCount = (from, to) => Math.round((new Date(to) - new Date(from)) / 86400000) + 1;

exports.apply = async (req, res) => {
  const { type, fromDate, toDate, reason } = req.body;
  if (!fromDate || !toDate || !reason) return res.status(400).json({ message: "From date, to date and reason are required" });
  const days = dayCount(fromDate, toDate);
  if (days < 1) return res.status(400).json({ message: "End date cannot be before start date" });
  if (type !== "unpaid" && days > req.user.leaveBalance)
    return res.status(400).json({ message: `You only have ${req.user.leaveBalance} leave days left` });
  const leave = await Leave.create({ employeeId: req.user._id, type, fromDate, toDate, days, reason });
  res.status(201).json(leave);
};

exports.mine = async (req, res) => {
  res.json(await Leave.find({ employeeId: req.user._id }).sort("-createdAt"));
};

// Manager: their team. HR: everyone.
exports.team = async (req, res) => {
  let filter = {};
  if (req.user.role === "manager") {
    const ids = (await User.find({ managerId: req.user._id }).select("_id")).map((u) => u._id);
    filter = { employeeId: { $in: ids } };
  }
  if (req.query.status) filter.status = req.query.status;
  res.json(await Leave.find(filter).populate("employeeId", "name department").populate("reviewedBy", "name").sort("-createdAt"));
};

exports.setStatus = async (req, res) => {
  const { status, reviewNote } = req.body;
  if (!["approved", "rejected"].includes(status)) return res.status(400).json({ message: "Status must be approved or rejected" });
  const leave = await Leave.findById(req.params.id).populate("employeeId");
  if (!leave) return res.status(404).json({ message: "Leave request not found" });
  if (leave.status !== "pending") return res.status(400).json({ message: "This request was already reviewed" });

  const isHR = req.user.role === "hr";
  const isTheirManager = String(leave.employeeId.managerId) === String(req.user._id);
  if (String(leave.employeeId._id) === String(req.user._id)) return res.status(403).json({ message: "You cannot review your own leave" });
  if (!isHR && !isTheirManager) return res.status(403).json({ message: "Only the employee's manager or HR can review this" });

  if (status === "approved" && leave.type !== "unpaid") {
    if (leave.employeeId.leaveBalance < leave.days) return res.status(400).json({ message: "Employee has insufficient leave balance" });
    leave.employeeId.leaveBalance -= leave.days;
    await leave.employeeId.save();
  }
  leave.status = status;
  leave.reviewedBy = req.user._id;
  leave.reviewNote = reviewNote || "";
  await leave.save();
  res.json(leave);
};

exports.cancel = async (req, res) => {
  const leave = await Leave.findOne({ _id: req.params.id, employeeId: req.user._id });
  if (!leave) return res.status(404).json({ message: "Leave request not found" });
  if (leave.status !== "pending") return res.status(400).json({ message: "Only pending requests can be cancelled" });
  await leave.deleteOne();
  res.json({ message: "Leave request cancelled" });
};
