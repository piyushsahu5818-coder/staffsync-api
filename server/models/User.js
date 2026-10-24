const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["hr", "manager", "employee"], default: "employee" },
    department: { type: String, default: "General" },
    designation: { type: String, default: "" },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    joiningDate: { type: Date, default: Date.now },
    leaveBalance: { type: Number, default: 20 },
  },
  { timestamps: true }
);

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};
userSchema.statics.hash = (plain) => bcrypt.hash(plain, 10);

module.exports = mongoose.model("User", userSchema);
