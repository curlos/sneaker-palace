import { useState, useEffect } from 'react';

// Hook
export const useWindowSize = () => {
	// Initialize state with the actual window size (this app is client-only, no SSR,
	// so there's no hydration mismatch to guard against). Starting at {0, 0} instead
	// made every mount look like a resize from 0 to the real width, which tripped
	// consumers' "the breakpoint changed" logic on first render.
	const [windowSize, setWindowSize] = useState({
		width: window.innerWidth,
		height: window.innerHeight,
	});
	useEffect(() => {
		// Handler to call on window resize
		function handleResize() {
			// Set window width/height to state
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		}
		// Add event listener
		window.addEventListener('resize', handleResize);
		// Call handler right away so state gets updated with initial window size
		handleResize();
		// Remove event listener on cleanup
		return () => window.removeEventListener('resize', handleResize);
	}, []); // Empty array ensures that effect is only run on mount
	return windowSize;
};
