const mongoose = require("mongoose");
module.exports = mongoose.model(
  "Announcement",
  new mongoose.Schema(
    {
      title: { type: String, required: true, trim: true },
      body: { type: String, required: true },
      postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
  )
);
