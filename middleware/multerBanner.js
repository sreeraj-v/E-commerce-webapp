const multer = require("multer");
const path = require("path");

const bannerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/banners/'); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);  // Unique filenames for banners
  }
});

const bannerFileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif|avif|WebP/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only for Banner!');
  }
};

const bannerUpload = multer({
  storage: bannerStorage,
  limits: { fileSize: 1024 * 1024 * 5 },  
  fileFilter: bannerFileFilter
});

module.exports = bannerUpload;
