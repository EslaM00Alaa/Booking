const multer = require("multer");
const path = require("path");

// photo storage
const photoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../images"));
  },
  filename: function (req, file, cb) {
    const originalname = file.originalname.toLowerCase();
    const name = originalname.replace(/\s+/g, ''); // Remove white spaces
    const uniqueSuffix = Date.now() + '' + Math.round(Math.random() * 1E9); // Add a unique suffix
    cb(null, uniqueSuffix + path.extname(name)); // Add original extension to the filename
  },
});

//photo upload middleware
const photoUpload = multer({
  storage: photoStorage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image")) cb(null, true);
    else cb({ message: "Unsupported File format" }, false);
  },
  limits: { fileSize: 1024 * 1024 * 5 }
});

module.exports = photoUpload;
