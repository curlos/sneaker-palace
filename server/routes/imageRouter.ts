import express, { Request, Response } from 'express';
import multer from 'multer';
import { uploadToCloudinary } from '../cloudinary/upload';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post('/', upload.single('image'), async (req: Request, res: Response) => {
	try {
		const file = req.file;

		if (!file) {
			return res.status(400).send({ error: 'No file provided' });
		}

		const response = await uploadToCloudinary(file) as any;

		return res.send({ 
			imagePath: response.secure_url
		});
	} catch (error) {
		console.error('Error uploading image:', error);
		res.status(500).send({ error: 'Failed to upload image' });
	}
});

export default router;
