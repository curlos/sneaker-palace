require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload file to Cloudinary
export const uploadToCloudinary = async (file: any) => {
	try {
		return new Promise((resolve, reject) => {
			const stream = cloudinary.uploader.upload_stream(
				{
					resource_type: 'image',
					folder: 'sneaker-palace',
					public_id: `${Date.now()}-${file.originalname?.split('.')[0] || 'upload'}`,
				},
				(error: any, result: any) => {
					if (error) {
						reject(error);
					} else {
						resolve(result);
					}
				}
			);
			stream.end(file.buffer);
		});
	} catch (error) {
		console.error('Cloudinary upload error:', error);
		throw error;
	}
};

