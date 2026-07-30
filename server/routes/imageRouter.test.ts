import request from 'supertest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { startTestServer, stopTestServer } from '../test/testServer';
import { uploadToCloudinary } from '../cloudinary/upload';

vi.mock('../cloudinary/upload');

let mongod: MongoMemoryReplSet;
let app: Awaited<ReturnType<typeof startTestServer>>['app'];

const FAKE_IMAGE_BUFFER = Buffer.from('fake-image-bytes');

beforeAll(async () => {
	({ app, mongod } = await startTestServer());
});

afterAll(async () => {
	await stopTestServer(mongod);
});

beforeEach(() => {
	// restoreMocks (vitest.config.ts) only restores vi.spyOn spies, not vi.mock()'d modules,
	// so call history on uploadToCloudinary would otherwise leak across tests.
	vi.mocked(uploadToCloudinary).mockReset();
});

describe('POST /images', () => {
	it('uploads a file and returns the Cloudinary secure_url as imagePath', async () => {
		vi.mocked(uploadToCloudinary).mockResolvedValueOnce({
			secure_url: 'https://res.cloudinary.com/demo/image/upload/v1/sneaker-palace/123-test.jpg',
		} as any);

		const res = await request(app).post('/images').attach('image', FAKE_IMAGE_BUFFER, 'test-image.jpg');

		expect(res.status).toBe(200);
		expect(res.body).toEqual({
			imagePath: 'https://res.cloudinary.com/demo/image/upload/v1/sneaker-palace/123-test.jpg',
		});
	});

	it('passes the uploaded file object (buffer, originalname, mimetype) through to uploadToCloudinary', async () => {
		vi.mocked(uploadToCloudinary).mockResolvedValueOnce({ secure_url: 'https://example.com/img.jpg' } as any);

		await request(app).post('/images').attach('image', FAKE_IMAGE_BUFFER, 'test-image.jpg');

		expect(uploadToCloudinary).toHaveBeenCalledTimes(1);
		const passedFile = vi.mocked(uploadToCloudinary).mock.calls[0][0];

		expect(passedFile.originalname).toBe('test-image.jpg');
		expect(passedFile.buffer).toEqual(FAKE_IMAGE_BUFFER);
		expect(passedFile.mimetype).toBe('image/jpeg');
	});

	it('returns 400 with an error message when no image field is provided', async () => {
		const res = await request(app).post('/images').send({});

		expect(res.status).toBe(400);
		expect(res.body).toEqual({ error: 'No file provided' });
		expect(uploadToCloudinary).not.toHaveBeenCalled();
	});

	it('returns 500 via the global error handler when a file is attached under the wrong field name', async () => {
		// upload.single('image') rejects any field name other than 'image' -- multer throws
		// MulterError('LIMIT_UNEXPECTED_FILE') inside its own middleware, before the route
		// handler's try/catch ever runs, so this hits server.ts's global error handler instead.
		const res = await request(app).post('/images').attach('wrongFieldName', FAKE_IMAGE_BUFFER, 'test-image.jpg');

		expect(res.status).toBe(500);
		expect(res.body).toEqual({ error: 'Internal server error' });
		expect(uploadToCloudinary).not.toHaveBeenCalled();
	});

	it('returns 500 with a generic error message when Cloudinary upload fails', async () => {
		vi.mocked(uploadToCloudinary).mockRejectedValueOnce(new Error('Cloudinary is down'));

		const res = await request(app).post('/images').attach('image', FAKE_IMAGE_BUFFER, 'test-image.jpg');

		expect(res.status).toBe(500);
		expect(res.body).toEqual({ error: 'Failed to upload image' });
	});

	it('returns 500 via the global error handler (not the route catch) when multiple files are attached to the single-file field', async () => {
		// upload.single('image') is internally maxCount: 1 for that field name. A second file
		// under the same field name makes multer itself throw MulterError('LIMIT_UNEXPECTED_FILE')
		// inside the middleware, before the route handler's own try/catch ever runs -- so this
		// hits server.ts's global 4-arg error handler instead, which returns a different body.
		const res = await request(app)
			.post('/images')
			.attach('image', FAKE_IMAGE_BUFFER, 'first.jpg')
			.attach('image', FAKE_IMAGE_BUFFER, 'second.jpg');

		expect(res.status).toBe(500);
		expect(res.body).toEqual({ error: 'Internal server error' });
		expect(uploadToCloudinary).not.toHaveBeenCalled();
	});
});
