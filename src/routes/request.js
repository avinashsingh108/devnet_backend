const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middlewares/userAuth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const mongoose = require("mongoose");
requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedstatus = ["interested", "ignored"];
      if (!allowedstatus.includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid status type " + status });
      }

      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          {
            fromUserId: toUserId,
            toUserId: fromUserId,
          },
        ],
      });
      if (existingConnectionRequest) {
        return res.status(400).json({
          message: "A connection request already exists between these users.",
        });
      }

      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).json({
          message: "User not found.",
        });
      }
      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const message =
        status === "interested"
          ? `You have expressed interest in connecting with user ${toUserId}.`
          : `You have ignored the connection request for user ${toUserId}.`;

      const data = await connectionRequest.save();
      res.json({
        message,
        data,
      });
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;
      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid status type " + status });
      }
      if (!mongoose.Types.ObjectId.isValid(requestId)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }
      
      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!connectionRequest) {
        return res
          .status(404)
          .json({ message: "Connection request not found" });
      }
      connectionRequest.status = status;
      const data = await connectionRequest.save();
      res.json({ message: `Connection request has been ${status}.`, data });
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
);
module.exports = requestRouter;
