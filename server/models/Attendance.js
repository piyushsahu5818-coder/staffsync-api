const mongoose = require("mongoose");
const attendanceSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    checkIn: { type: Date },
    checkOut: { type: Date },
    status: { type: String, enum: ["present", "late", "half-day"], default: "present" },
  },
  { timestamps: true }
);
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
module.exports = mongoose.model("Attendance", attendanceSchema);
