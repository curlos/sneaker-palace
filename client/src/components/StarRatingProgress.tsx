import React from 'react';

interface Props {
	rating: number;
	percentage: number;
}

const StarRatingProgress = ({ rating, percentage }: Props) => {
	const roundedPercentage = Math.round(percentage * 100);
	const label = rating === 1 ? '1 star' : `${rating} stars`;

	return (
		<div>
			<div>{label}</div>
			<div className="relative pt-1">
				<div className="overflow-hidden h-3 mb-4 text-xs flex rounded bg-lakersGold-100">
					<div
						role="progressbar"
						aria-label={label}
						aria-valuenow={roundedPercentage}
						aria-valuemin={0}
						aria-valuemax={100}
						style={{ width: `${roundedPercentage}%` }}
						className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-lakersGold-500"
					></div>
				</div>
			</div>
		</div>
	);
};

export default StarRatingProgress;
