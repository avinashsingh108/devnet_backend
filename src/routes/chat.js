const express = require("express");
const { userAuth } = require("../middlewares/userAuth");
const { Chat } = require("../models/chat");
const chatRouter = express.Router();

chatRouter.post("/chat/history", userAuth, async (req, res) => {
  try {
    const senderId = req.user._id; 
    const { targetUserId } = req.body; 

    if (!targetUserId) {
      return res.status(400).json({ message: "Target user ID is required" });
    }

    const chat = await Chat.findOne({
      participants: { $all: [senderId, targetUserId] },
    }).populate("messages.senderId", "firstName lastName profilePic");

    if (!chat) {
      return res.status(200).json({ message: "No previous chats", messages: [] });
    }

    res.status(200).json({ messages: chat.messages });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = chatRouter;
