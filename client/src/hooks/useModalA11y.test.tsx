import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useModalA11y } from './useModalA11y';

const TestModal = ({ onClose }: { onClose: () => void }) => {
	const ref = useModalA11y<HTMLDivElement>(onClose);
	return (
		<div ref={ref}>
			<button>First</button>
			<button>Last</button>
		</div>
	);
};

const EmptyModal = ({ onClose }: { onClose: () => void }) => {
	const ref = useModalA11y<HTMLDivElement>(onClose);
	return <div ref={ref} />;
};

const DynamicModal = ({ onClose, extra }: { onClose: () => void; extra: boolean }) => {
	const ref = useModalA11y<HTMLDivElement>(onClose);
	return (
		<div ref={ref}>
			<button>First</button>
			<button>Last</button>
			{extra && <button>Extra</button>}
		</div>
	);
};

it('focuses the first focusable element on mount', () => {
	render(<TestModal onClose={() => {}} />);
	expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
});

it('calls onClose when Escape is pressed', async () => {
	const onClose = vi.fn();
	const user = userEvent.setup();
	render(<TestModal onClose={onClose} />);

	await user.keyboard('{Escape}');

	expect(onClose).toHaveBeenCalledTimes(1);
});

it('wraps focus from the last element back to the first on Tab', async () => {
	const user = userEvent.setup();
	render(<TestModal onClose={() => {}} />);
	screen.getByRole('button', { name: 'Last' }).focus();

	await user.tab();

	expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
});

it('wraps focus from the first element back to the last on Shift+Tab', async () => {
	const user = userEvent.setup();
	render(<TestModal onClose={() => {}} />);

	await user.tab({ shift: true });

	expect(screen.getByRole('button', { name: 'Last' })).toHaveFocus();
});

it('restores focus to the previously focused element on unmount', () => {
	const trigger = document.createElement('button');
	document.body.appendChild(trigger);
	trigger.focus();

	const { unmount } = render(<TestModal onClose={() => {}} />);
	unmount();

	expect(trigger).toHaveFocus();
	document.body.removeChild(trigger);
});

it('does not move focus when there are no focusable elements', () => {
	render(<EmptyModal onClose={() => {}} />);

	expect(document.body).toHaveFocus();
});

it('treats an element added after mount as the new last element when wrapping', async () => {
	const user = userEvent.setup();
	const { rerender } = render(<DynamicModal onClose={() => {}} extra={false} />);
	rerender(<DynamicModal onClose={() => {}} extra={true} />);
	screen.getByRole('button', { name: 'First' }).focus();

	await user.tab({ shift: true });

	expect(screen.getByRole('button', { name: 'Extra' })).toHaveFocus();
});

it('stops listening for Escape after unmount', async () => {
	const onClose = vi.fn();
	const user = userEvent.setup();
	const { unmount } = render(<TestModal onClose={onClose} />);
	unmount();

	await user.keyboard('{Escape}');

	expect(onClose).not.toHaveBeenCalled();
});
