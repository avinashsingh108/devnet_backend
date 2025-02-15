const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/userAuth");
const validateEditProfileData = require("../utils/validateEditProfileData");
const validateUpdatePassword = require("../utils/validateUpdatePassword");
const bcrypt = require("bcrypt");
const { upload, uploadImage } = require("../middlewares/fileUpload");
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    const user = req.user;
    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

profileRouter.patch(
  "/profile/edit",
  userAuth,
  upload.single("profilePic"),
  uploadImage,
  async (req, res) => {
    try {
      if (!validateEditProfileData(req)) {
        throw new Error("Invalid edit operation");
      }
      const user = req.user;
      Object.keys(req.body).forEach((key) => {
        if (key === "skills" && typeof req.body[key] === "string") {
          user[key] = JSON.parse(req.body[key]);
        } else {
          user[key] = req.body[key];
        }
      });

      if (req.imageUrl) {
        user.profilePic = req.imageUrl;
      }
      await user.save();
      res.send("Updated successfully");
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
);

profileRouter.patch("/profile/update-password", userAuth, async (req, res) => {
  try {
    await validateUpdatePassword(req);
    const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
    req.user.password = hashedPassword;
    await req.user.updateOne({ password: hashedPassword });
    res.send({ message: "Password updated successfully." });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

profileRouter.delete("/profile", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    await ConnectionRequest.deleteMany({
      $or: [{ fromUserId: userId }, { toUserId: userId }],
    });

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found." });
    }
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    res.status(200).json({ message: "Account deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the account." });
  }
});

module.exports = profileRouter;
