const express = require("express");
const userRouter = express.Router();
const { userAuth } = require("../middlewares/userAuth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", [
      "firstName",
      "lastName",
      "profilePic",
      "bio",
      "skills",
      "gender",
      "dob",
      "location",
    ]);
    res.json({
      message: "Data fetched successfully",
      data: connectionRequests,
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", [
        "firstName",
        "lastName",
        "profilePic",
        "bio",
        "skills",
        "gender",
        "location",
        "dob"
      ])
      .populate("toUserId", [
        "firstName",
        "lastName",
        "profilePic",
        "bio",
        "skills",
        "gender",
        "location",
        "dob"
      ]);

    const data = connectionRequests.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });
    res.json(data);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;
    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    const usersToHide = new Set();
    connectionRequests.forEach((req) => {
      usersToHide.add(req.fromUserId.toString());
      usersToHide.add(req.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        {
          _id: { $nin: Array.from(usersToHide) },
        },
        {
          _id: { $ne: loggedInUser._id },
        },
      ],
    })
      .select("firstName lastName profilePic bio skills location")
      .skip(skip)
      .limit(limit);
    res.send({ users: users });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

userRouter.post("/user/profile", userAuth, async (req, res) => {
  try {
    const _id = req.body.userId;

    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User not found");
    }
    res.send(user);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = userRouter;
