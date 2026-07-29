import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function useModalA11y<T extends HTMLElement = HTMLElement>(onClose: () => void) {
	const containerRef = useRef<T>(null);

	useEffect(() => {
		const previouslyFocusedElement = document.activeElement as HTMLElement | null;
		const focusable = containerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
		focusable?.[0]?.focus();

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose();
				return;
			}

			if (e.key === 'Tab') {
				// Re-query on every keydown instead of reusing the mount-time snapshot above,
				// since a modal's content (e.g. search results) can change after it opens.
				const currentFocusable = containerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
				if (!currentFocusable || currentFocusable.length === 0) return;

				const first = currentFocusable[0];
				const last = currentFocusable[currentFocusable.length - 1];

				if (e.shiftKey && document.activeElement === first) {
					e.preventDefault();
					last.focus();
				} else if (!e.shiftKey && document.activeElement === last) {
					e.preventDefault();
					first.focus();
				}
			}
		};

		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			previouslyFocusedElement?.focus();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return containerRef;
}
