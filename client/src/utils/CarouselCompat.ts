import CarouselImport from 'react-multi-carousel';

// react-multi-carousel ships old Babel-style CJS interop (exports.__esModule + exports.default),
// the same shape that broke redux-persist's storage import and react-star-ratings — Vite 8's
// Rolldown bundler sometimes resolves `import X from '...'` to the whole CJS exports object
// instead of the unwrapped default, causing "Element type is invalid... got: object". Unwrap
// defensively: use `.default` if present (the broken case), otherwise use the import directly
// (handles the import resolving correctly now or after a future Rolldown/package fix).
const Carousel = (CarouselImport as unknown as { default?: typeof CarouselImport }).default ?? CarouselImport;

export default Carousel;
