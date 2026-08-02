import '@testing-library/jest-dom';
import dotenv from 'dotenv';
import { server } from './mocks/server';

dotenv.config({ path: ['.env.local', '.env'] });

// jsdom doesn't implement IntersectionObserver (used by MoreShoes.tsx's carousel visibility
// tracking); without a stub, mounting it throws and React unmounts the whole tree.
class MockIntersectionObserver implements IntersectionObserver {
	readonly root: Element | Document | null = null;
	readonly rootMargin: string = '';
	readonly scrollMargin: string = '';
	readonly thresholds: ReadonlyArray<number> = [];
	observe = () => {};
	unobserve = () => {};
	disconnect = () => {};
	takeRecords = () => [];
}
global.IntersectionObserver = MockIntersectionObserver;

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
