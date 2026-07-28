import mongoose from 'mongoose';
const ATLAS_URI = process.env.ATLAS_URI;

export const connectToServer = () => {
	mongoose.connect(ATLAS_URI as string);

	const connection = mongoose.connection;
	connection.once('open', () => {
		console.log('Connected to MongoDB!');
	});
};
