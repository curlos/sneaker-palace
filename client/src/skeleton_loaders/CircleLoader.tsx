import React from 'react';

interface Props {
	size: number;
	label?: string;
}

const CircleLoader = ({ size, label = 'Loading' }: Props) => {
	return (
		<div role="status">
			<div
				style={{ borderTopColor: 'transparent' }}
				className={`w-${size} h-${size} border-4 border-blue-400 border-solid rounded-full animate-spin`}
			></div>
			<span className="sr-only">{label}</span>
		</div>
	);
};

export default CircleLoader;
