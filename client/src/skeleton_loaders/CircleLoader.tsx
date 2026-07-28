import React from 'react';

interface Props {
	size: 5 | 10 | 12 | 16;
	label?: string;
}

const sizeClasses = {
	5: 'w-5 h-5',
	10: 'w-10 h-10',
	12: 'w-12 h-12',
	16: 'w-16 h-16',
};

const CircleLoader = ({ size, label = 'Loading' }: Props) => {
	return (
		<div role="status">
			<div
				style={{ borderTopColor: 'transparent' }}
				className={`${sizeClasses[size]} border-4 border-blue-400 border-solid rounded-full animate-spin`}
			></div>
			<span className="sr-only">{label}</span>
		</div>
	);
};

export default CircleLoader;
