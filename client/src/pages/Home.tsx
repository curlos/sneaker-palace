import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Carousel from '../components/Carousel';
import GenderShopLink from '../components/GenderShopLink';

interface BrandLinkProps {
	brands: string[];
	logoPath: string;
}

const BrandLink = ({ brands, logoPath }: BrandLinkProps) => {
	return (
		<div className="w-14/100 md:w-5/12">
			<Link to={`/shoes?brands=${encodeURIComponent(brands.join(','))}`}>
				<img src={logoPath} className="w-full" alt="" />
			</Link>
		</div>
	);
};

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
					<BrandLink brands={["Nike"]} logoPath="/assets/brand_logos/nike.svg" />
					<BrandLink brands={["Jordan", "Air Jordan"]} logoPath="/assets/brand_logos/jordan.svg" />
					<BrandLink brands={["adidas"]} logoPath="/assets/brand_logos/adidas.svg" />
					<BrandLink brands={["New Balance"]} logoPath="/assets/brand_logos/new balance.svg" />
					<BrandLink brands={["ASICS"]} logoPath="/assets/brand_logos/asics.svg" />
					<BrandLink brands={["Hoka One One"]} logoPath="/assets/brand_logos/hoka.svg" />
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
