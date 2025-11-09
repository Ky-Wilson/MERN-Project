const multer = require('multer');

// configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    fileName: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

// configure filter
const fileFilter = (req, file, cb) => {
    const  allowedFileTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if(allowedFileTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error("File type not supported"), false);
    }
};

// configure multer
const upload = multer({
    storage,
    fileFilter
});

module.exports = upload;