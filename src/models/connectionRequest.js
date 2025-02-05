const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: "{VALUE} is not a valid status",
      },
    },
  },
  {
    timestamps: true,
  }
);
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

connectionRequestSchema.pre("save", function (next) {
  if (this.fromUserId.toString() === this.toUserId.toString()) {
    throw new Error("Cannot send request to youself");
  }
  next();
});

module.exports = mongoose.model("ConnectionRequest", connectionRequestSchema);
