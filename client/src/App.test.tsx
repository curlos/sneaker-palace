import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import App from './App';
import { createTestStore } from './test-utils';

const renderApp = (route: string) => {
	window.history.pushState({}, '', route);
	return render(
		<Provider store={createTestStore()}>
			<App />
		</Provider>
	);
};

it('redirects to login when visiting the submit-review route while logged out', async () => {
	renderApp('/shoe/submit-review/some-shoe-id');

	await screen.findByRole('heading', { name: /your account for everything/i });
	expect(window.location.pathname).toBe('/login');
});

it('redirects home when visiting settings while logged out', async () => {
	renderApp('/settings');

	await screen.findByRole('heading', { name: /popular brands/i });
	expect(window.location.pathname).toBe('/');
});
