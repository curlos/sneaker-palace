import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Carousel from '../components/Carousel';
import GenderShopLink from '../components/GenderShopLink';

const Home = () => {
	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	return (
		<div className="flex-grow">
			<Carousel />
			<div className="container mx-auto px-4 max-w-7xl">
				<div className="flex justify-between text-xl font-semibold mt-4 md:text-lg">
					<div>Popular Brands</div>
					<Link to={`/shoes`} className="underline">
						See All
					</Link>
				</div>
				<div className="flex flex-wrap gap-2 items-center justify-between md:mt-4">
					<div className="w-14/100 md:w-5/12">
						<Link to={{ pathname: '/shoes', state: { brand: 'Nike' } }}>
							<img src="/assets/brand_logos/nike.svg" className="w-full" alt="" />
						</Link>
					</div>

					<div className="w-14/100 md:w-5/12">
						<Link to={{ pathname: '/shoes', state: { brand: 'AIR JORDAN' } }}>
							<img src="/assets/brand_logos/jordan.svg" className="w-full" alt="" />
						</Link>
					</div>

					<div className="w-14/100 md:w-5/12">
						<Link to={{ pathname: '/shoes', state: { brand: 'ADIDAS' } }}>
							<img src="/assets/brand_logos/adidas.svg" className="w-full" alt="" />
						</Link>
					</div>

					<div className="w-14/100 md:w-5/12">
						<Link to={{ pathname: '/shoes', state: { brand: 'NEW BALANCE' } }}>
							<img src="/assets/brand_logos/new balance.svg" className="w-full" alt="" />
						</Link>
					</div>

					<div className="w-14/100 md:w-5/12">
						<Link to={{ pathname: '/shoes', state: { brand: 'LOUIS VUITTON' } }}>
							<img src="/assets/brand_logos/louis vuitton.svg" className="w-full" alt="" />
						</Link>
					</div>

					<div className="w-14/100 md:w-5/12">
						<Link to={{ pathname: '/shoes', state: { brand: 'GUCCI' } }}>
							<img src="/assets/brand_logos/gucci.svg" className="w-full" alt="" />
						</Link>
					</div>
				</div>

				<div className="mt-5 flex w-full mb-10 md:block">
					<GenderShopLink
						gender="men"
						imageSrc="/assets/landing_page/mens.jpeg"
						label="Shop Men"
					/>
					<GenderShopLink
						gender="women"
						imageSrc="/assets/landing_page/womens.jpeg"
						label="Shop Women"
					/>
					<GenderShopLink
						gender="youth"
						imageSrc="/assets/landing_page/kids.jpeg"
						label="Shop Kids"
					/>
				</div>
			</div>
		</div>
	);
};

export default Home;
