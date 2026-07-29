import StarRatingsImport from 'react-star-ratings';

// react-star-ratings ships old Babel-style CJS interop (exports.__esModule + exports.default),
// the same shape that broke redux-persist's storage import — Vite 8's Rolldown bundler
// sometimes resolves `import X from '...'` to the whole CJS exports object instead of the
// unwrapped default, causing "Element type is invalid... got: object". Unwrap defensively:
// use `.default` if present (the broken case), otherwise use the import directly (handles
// the import resolving correctly now or after a future Rolldown/package fix).
const StarRatings = (StarRatingsImport as unknown as { default?: typeof StarRatingsImport }).default ?? StarRatingsImport;

export default StarRatings;
