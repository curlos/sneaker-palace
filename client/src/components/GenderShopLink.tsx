import { Link } from 'react-router-dom';

interface GenderShopLinkProps {
	gender: string;
	imageSrc: string;
	label: string;
	className?: string;
}

const GenderShopLink = ({ gender, imageSrc, label, className = '' }: GenderShopLinkProps) => {
	return (
		<div className={`w-4/12 md:w-full md:mb-8 ${className}`}>
			<Link
				to={`/shoes?genders=${encodeURIComponent(gender)}`}
				className="hover:underline font-bold text-xl md:text-2xl"
			>
				<img src={imageSrc} alt={`${label} Shoe`} className="w-full md:mb-2" />
				<div className="mt-2">{label}</div>
			</Link>
		</div>
	);
};

export default GenderShopLink;