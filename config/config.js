const multer = require('multer');
const crypto = require('crypto');
const path = require('path');

const userImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/uploads/userimages')
    },
    filename: function (req, file, cb) {
        crypto.randomBytes(14, function (err, buffer) {
          var fn = buffer.toString('hex') + path.extname(file.originalname);
          cb(null, fn)

        })
    }
})


const productImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/uploads/productimages')
    },
    filename: function (req, file, cb) {
        crypto.randomBytes(14, function (err, buffer) {
          var fn = buffer.toString('hex') + path.extname(file.originalname);
          cb(null, fn)

        })
    }
})

module.exports = { userImageStorage , productImageStorage};



