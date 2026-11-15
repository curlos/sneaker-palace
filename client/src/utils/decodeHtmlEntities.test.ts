import { decodeHtmlEntities } from './decodeHtmlEntities';

test('decodes numeric and named HTML entities', () => {
	expect(decodeHtmlEntities('Kobe 6 &#39;Dodgers&#39; &amp; LA&#39;s &quot;8&quot;')).toBe(
		`Kobe 6 'Dodgers' & LA's "8"`
	);
});

test('leaves plain text unchanged', () => {
	expect(decodeHtmlEntities("Jordan 1 'UNC Toe'")).toBe("Jordan 1 'UNC Toe'");
});

test('returns markup as text instead of elements', () => {
	expect(decodeHtmlEntities('&lt;b&gt;bold&lt;/b&gt;')).toBe('<b>bold</b>');
});
