import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCarouselData } from '../utils/getCarouselData';

const Carousel = () => {
	const [num, setNum] = useState(0);
	const data = getCarouselData();
	const [currentShoe, setCurrentShoe] = useState(Object.values(data)[num]);

	useEffect(() => {
		const interval = setInterval(() => {
			if (num + 1 === data.length) {
				setNum(0);
				setCurrentShoe(Object.values(data)[0]);
			} else {
				setNum(num + 1);
				setCurrentShoe(Object.values(data)[num + 1]);
			}
		}, 4000);
		return () => clearInterval(interval);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data]);

	return (
		<div
			className={`carousel-bg flex items-center text-white font-bold transition-all ease-in-out duration-1000 transform translate-x-0 slide`}
			style={{
				height: 'calc(100vh - 72px)',
				backgroundImage: `url(${currentShoe.relativeURL})`,
				backgroundColor: currentShoe.bgColor,
			}}
		>
			<div className="container mx-auto max-w-7xl">
				<div className="ml-10 pb-10 w-1/3 sm:w-3/4">
					<div className="text-5xl mb-6" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>{currentShoe.name}</div>
					<Link to={`/shoe/${currentShoe.shoeID}`} className="bg-black border-2 border-gray-300 text-white text-xl rounded-full px-6 py-2 no-underline hover:bg-gray-800">
						Shop Now
					</Link>
				</div>
			</div>
		</div>
	);
};

export default Carousel;
