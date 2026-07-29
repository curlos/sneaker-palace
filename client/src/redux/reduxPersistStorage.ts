// Replaces `import storage from 'redux-persist/lib/storage'`. That package ships as an
// old-style CommonJS module, and Vite 8's Rolldown bundler handles its CJS interop
// differently than before, resolving `storage` to the whole exports object instead of
// the unwrapped default export — causing `storage.getItem/setItem is not a function` at
// runtime. This adapter fulfills the same storage contract directly against
// window.localStorage, sidestepping the interop bug entirely.
const noopStorage = {
	getItem: () => Promise.resolve(null),
	setItem: () => Promise.resolve(),
	removeItem: () => Promise.resolve(),
};

const createLocalStorage = () => {
	// Some browsers (e.g. Safari private browsing) expose window.localStorage but throw
	// on actual use — fall back to a no-op rather than crashing the app.
	try {
		const testKey = '__redux_persist_test__';
		window.localStorage.setItem(testKey, testKey);
		window.localStorage.removeItem(testKey);
	} catch {
		return noopStorage;
	}

	return {
		getItem: (key: string) => Promise.resolve(window.localStorage.getItem(key)),
		setItem: (key: string, value: string) => {
			try {
				window.localStorage.setItem(key, value);
				return Promise.resolve();
			} catch (err) {
				return Promise.reject(err);
			}
		},
		removeItem: (key: string) => Promise.resolve(window.localStorage.removeItem(key)),
	};
};

const storage = createLocalStorage();

export default storage;
