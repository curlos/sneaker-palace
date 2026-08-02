import { ReactElement, ReactNode } from 'react';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { render, RenderOptions } from '@testing-library/react';
import userReducer from './redux/userRedux';
import { baseAPI } from './api/api';
// Import API slices so their endpoints are registered on baseAPI, mirroring redux/store.tsx
import './api/shoesApi';
import './api/ratingsApi';
import './api/cartApi';
import './api/userApi';
import './api/ordersApi';
import './api/checkoutApi';
import { RootState } from './redux/store';

const rootReducer = combineReducers({
	user: userReducer,
	[baseAPI.reducerPath]: baseAPI.reducer,
});

export const createTestStore = (preloadedState?: Partial<RootState>) =>
	configureStore({
		reducer: rootReducer,
		middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseAPI.middleware),
		preloadedState,
	});

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
	preloadedState?: Partial<RootState>;
	route?: string;
}

export const renderWithProviders = (ui: ReactElement, options: RenderWithProvidersOptions = {}) => {
	const { preloadedState, route = '/', ...renderOptions } = options;
	const store = createTestStore(preloadedState);
	const history = createMemoryHistory({ initialEntries: [route] });

	const Wrapper = ({ children }: { children: ReactNode }) => (
		<Provider store={store}>
			<Router history={history}>{children}</Router>
		</Provider>
	);

	return { store, history, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

// eslint-disable-next-line react-refresh/only-export-components -- test-only re-export, never part of the app's HMR tree
export * from '@testing-library/react';
