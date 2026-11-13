// Some shoe text (e.g. `story`) was stored with HTML entities such as `&#39;` and `&amp;`.
// DOMParser decodes them without running scripts or loading anything, and the result
// is still rendered by React as plain text, so markup in the input stays inert.
export const decodeHtmlEntities = (text: string): string =>
	new DOMParser().parseFromString(text, 'text/html').documentElement.textContent ?? '';
