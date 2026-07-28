interface ImportMetaEnv {
	readonly VITE_STRIPE: string;
	readonly VITE_CLIENT_URL: string;
	readonly VITE_DEV_URL: string;
	readonly VITE_PRODUCTION_URL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
