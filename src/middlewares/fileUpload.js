const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const fs = require("fs");
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, JPG are allowed."), false);
  }
};
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

async function uploadImage(req, res, next) {
  if (!req.file) {
    return next();
  }

  try {
    const response = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto",
    });
    req.body.profilePic = response.secure_url;
    fs.unlinkSync(req.file.path);
    next();
  } catch (error) {
    fs.unlinkSync(req.file.path);
    console.error("Error uploading image to Cloudinary:", error);
    return res.status(500).json({ error: "Failed to upload image" });
  }
}

module.exports = { upload, uploadImage };
