import React from 'react';

interface Props {
	size: number;
}

const CircleLoader = ({ size }: Props) => {
	return (
		<div>
			<div
				style={{ borderTopColor: 'transparent' }}
				className={`w-${size} h-${size} border-4 border-blue-400 border-solid rounded-full animate-spin`}
			></div>
		</div>
	);
};

export default CircleLoader;
