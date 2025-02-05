const User = require("../models/user");

const isEmailAlreadyUsed = async (emailId) => {
  const user = await User.findOne({ email: emailId });
  if (user) {
    throw new Error("Invalid Credentials");
  }
};

module.exports = isEmailAlreadyUsed;