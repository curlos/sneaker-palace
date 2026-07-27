import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

export async function startTestServer() {
	const mongod = await MongoMemoryServer.create();

	// Point the app at the in-memory Mongo instance and skip app.listen()
	// before importing server.ts, since both are read at import time.
	process.env.ATLAS_URI = mongod.getUri();
	process.env.VERCEL = '1';
	process.env.JWT_SEC = process.env.JWT_SEC || 'test-secret';

	const serverModule = await import('../server');
	const app = serverModule.default;

	await new Promise<void>((resolve) => {
		if (mongoose.connection.readyState === 1) return resolve();
		mongoose.connection.once('open', () => resolve());
	});

	return { app, mongod };
}

export async function stopTestServer(mongod: MongoMemoryServer) {
	await mongoose.disconnect();
	await mongod.stop();
}
