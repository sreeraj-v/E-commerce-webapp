const multer = require("multer");
const path = require("path")

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
})

const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif|avif/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
};

const upload = multer({
  storage:storage,
  limits:{fileSize:1024*1024*5},
  fileFilter:fileFilter
})

module.exports = upload;