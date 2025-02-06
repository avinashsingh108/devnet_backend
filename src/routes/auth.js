const express = require("express");
const authRouter = express.Router();
const validator = require("validator");
const isEmailAlreadyUsed = require("../utils/isEmailAlreadyUsed");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { uploadImage, upload } = require("../middlewares/fileUpload");

authRouter.post(
  "/signup",
  upload.single("profilePic"),
  uploadImage,
  async (req, res) => {
    const user = new User(req.body);
    const { email, password, skills } = req.body;
    try {
      if (!validator.isEmail(email)) {
        return res.status(400).send("Invalid email address.");
      }
      if (!validator.isStrongPassword(password)) {
        return res.status(400).send("Enter a strong password.");
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      user.skills = JSON.parse(skills);
      await isEmailAlreadyUsed(req.body.email);
      await user.save();
      const token = jwt.sign({ _id: user._id }, process.env.JWT_HASH_KEY, {
        expiresIn: "1d",
      });
      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000), 
        httpOnly: true,
        secure: true,
        sameSite: 'None',
      });

      res.json({ message: "Signup successful", token, user });
    } catch (error) {
      res.status(400).send("Something went wrong, " + error);
    }
  }
);

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("Invalid Credentials");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      const token = jwt.sign({ _id: user._id }, process.env.JWT_HASH_KEY, {
        expiresIn: "1d",
      });
      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000), 
        httpOnly: true,
        secure: true,
        sameSite: 'None',
      });
      res.json({ message: "Login successfull", data: user });
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (error) {
    res.status(400).send("Something went wrong: " + error);
  }
});

authRouter.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
  });

  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = authRouter;
