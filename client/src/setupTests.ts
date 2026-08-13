import '@testing-library/jest-dom';
import { configure } from '@testing-library/dom';
import dotenv from 'dotenv';
import { server } from './mocks/server';

dotenv.config({ path: ['.env.local', '.env'], quiet: true });

// Default is 1000ms, which is fine on a fast local machine but too tight on
// GitHub Actions' shared runners - waitFor/findBy* queries were timing out
// there even though nothing was actually broken.
configure({ asyncUtilTimeout: 5000 });

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

// jsdom doesn't implement URL.createObjectURL (used for local image previews
// in AccountDetails.tsx/ReviewForm.tsx before a file is uploaded).
URL.createObjectURL = () => 'blob:mock-preview-url';

// jsdom doesn't implement window.scrollTo (called on nearly every page to
// reset scroll position on navigation); without a stub it logs a "Not
// implemented" error to the console on every render.
window.scrollTo = () => {};

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
