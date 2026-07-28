import React from 'react';

const FullShoeSkeleton = () => {
	return (
		<div className="flex justify-center">
			<div className="flex animate-pulse bg-transparent gap-4 mb-2 w-[1800px] max-xl:block">
				<div className="p-1 bg-gray-300 rounded-2xl w-full h-[900px] flex-[2] max-xl:mb-4 max-sm:h-[300px] max-md:h-[400px] max-lg:h-[600px] max-xl:h-[700px]"></div>

				<div className="rounded-2xl w-full h-[900px] flex flex-col flex-[2]">
					<div className="bg-gray-300 w-full h-[100px] rounded-2xl mb-4"></div>
					<div className="bg-gray-300 w-full h-[400px] rounded-2xl mb-4"></div>
					<div className="bg-gray-300 w-1/2 h-4 rounded-2xl mb-2"></div>
					<div className="bg-gray-300 w-1/4 h-4 rounded-2xl mb-2"></div>
					<div className="bg-gray-300 w-1/3 h-4 rounded-2xl mb-2"></div>
					<div className="bg-gray-300 w-1/2 h-4 rounded-2xl mb-2"></div>
					<div className="bg-gray-300 w-full h-[350px] rounded-2xl"></div>
				</div>
			</div>
		</div>
	);
};

export default FullShoeSkeleton;
