import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FailureMessage from './FailureMessage';

describe('FailureMessage', () => {
	it('displays the message', () => {
		render(<FailureMessage message="Something went wrong" setShowMessage={vi.fn()} />);
		expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
	});

	it('calls setShowMessage(false) when dismissed', () => {
		const setShowMessage = vi.fn();
		render(<FailureMessage message="Something went wrong" setShowMessage={setShowMessage} />);

		fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));

		expect(setShowMessage).toHaveBeenCalledWith(false);
	});
});
