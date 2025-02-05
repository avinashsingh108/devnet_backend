const bcrypt = require("bcrypt");

const validateUpdatePassword = async (req) => {
  const { currentPassword, newPassword } = req.body;
  const user = req.user;

  if (!currentPassword || !newPassword) {
    throw new Error("Both current and new passwords are required.");
  }

  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    throw new Error("Current password is incorrect.");
  }

  if (newPassword.length < 8) {
    throw new Error("New password must be at least 8 characters long.");
  }
};

module.exports = validateUpdatePassword;
