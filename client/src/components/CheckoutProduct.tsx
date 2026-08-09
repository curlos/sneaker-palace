import ShoeImage from './ShoeImage';
import { IProduct, Shoe } from '../types/types';

interface Props {
	product: IProduct;
	shoe: Shoe;
	type: string;
}

const CheckoutProduct = ({ product, shoe, type }: Props) => {
	return type === 'small' ? (
		<div className="flex gap-6 mb-7 text-sm">
			<div className="flex-[2]">
				<ShoeImage src={shoe.image?.original || ''} alt={shoe.name || ''} />
			</div>

			<div className="text-gray-600 flex-[4]">
				<div className="text-black">{shoe.name}</div>
				<div>Size: {product.size}</div>
				<div>Colorway: {shoe.colorway}</div>
				<div>Quantity: {product.quantity}</div>
				<div>${shoe.retailPrice && Number(product.quantity * shoe.retailPrice).toFixed(2)}</div>
			</div>
		</div>
	) : (
		<div className="flex justify-between mb-7 text-base">
			<div className="flex gap-5">
				<div>
					<ShoeImage src={shoe.image?.original || ''} alt={shoe.name || ''} className="h-40 w-40" />
				</div>

				<div className="text-gray-600">
					<div className="text-black font-medium">{shoe.name}</div>
					<div>Size: {product.size}</div>
					<div className="max-sm:hidden">Colorway: {shoe.colorway}</div>
					<div>Quantity: {product.quantity}</div>
				</div>
			</div>

			<div className="text-lg font-medium">${shoe.retailPrice && Number(product.quantity * shoe.retailPrice).toFixed(2)}</div>
		</div>
	);
};

export default CheckoutProduct;
