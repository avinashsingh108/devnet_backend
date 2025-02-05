const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  const cookies = req.cookies;
  const { token } = cookies;
  try {
    if (!token) {
      return res.status(401).send("Please login.");
    }
    const decodedMessage = jwt.verify(token, process.env.JWT_HASH_KEY);
    const { _id } = decodedMessage;
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User not found");
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(400).send(error.message);
  }
};

module.exports = {
  userAuth,
};
