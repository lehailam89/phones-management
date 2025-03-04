const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET
});

const streamUpload = (file) => {
    return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
            if (result) {
                resolve(result);
            } else {
                reject(error);
            }
        });

        streamifier.createReadStream(file.buffer).pipe(stream);
    });
};

module.exports.upload = async (req, res, next) => {
    if (req.files) {
        try {
            for (const fieldName in req.files) {
                req.body[fieldName] = [];
                for (const file of req.files[fieldName]) {
                    let result = await streamUpload(file);
                    req.body[fieldName].push(result.url);
                }
            }
            next();
        } catch (error) {
            console.error(error);
            res.status(500).send("Error uploading files");
        }
    } else {
        next();
    }
};