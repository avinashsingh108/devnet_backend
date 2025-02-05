
const validateEditProfileData = (req) => {
  const allowedEditableFields = [
    "firstName",
    "lastName",
    "bio",
    "skills",
    "location",
    "profilePic",
  ];

  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditableFields.includes(field)
  );
  return isEditAllowed;
};

module.exports = validateEditProfileData;
