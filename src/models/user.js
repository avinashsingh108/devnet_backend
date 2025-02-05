const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 15,
      trim: true,
    },
    lastName: {
      type: String,
      maxlength: 15,
      trim: true,
    },
    dob: {
      type: Date,
      required: true,
      validate: {
        validator: (value) => {
          const today = new Date();
          const ageLimit = 18;
          const minDate = new Date(
            today.setFullYear(today.getFullYear() - ageLimit)
          );
          return value <= minDate;
        },
        message: "User must be at least 18 years old.",
      },
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      validate: {
        validator: function (value) {
          return validator.isStrongPassword(value);
        },
        message: "Enter a Strong Password",
      },
    },

    profilePic: {
      type: String,
    },
    bio: {
      type: String,
      maxlength: 200,
      trim: true,
      required: true,
    },
    skills: {
      type: [String],
      validate: {
        validator: function (value) {
          return value.length >= 3 && value.length <= 6;
        },
        message: "Cannot add less than 3 and more than 6 skills",
      },
    },
    location: {
      type: String,
      maxlength: 150,
      trim: true,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
