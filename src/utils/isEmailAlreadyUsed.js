const User = require("../models/user");

const isEmailAlreadyUsed = async (emailId) => {
  const user = await User.findOne({ email: emailId });
  if (user) {
    throw new Error("There is already an account with this email.");
  }
};

module.exports = isEmailAlreadyUsed;