import moment from 'moment';
import { Link } from 'react-router-dom';
import { useGetShoesBulkQuery } from '../api/shoesApi';
import CircleLoader from '../skeleton_loaders/CircleLoader';
import { IOrder, IProduct, Shoe } from '../types/types';
import SmallOrderShoe from './SmallOrderShoe';

interface Props {
	order: IOrder;
}

const SmallOrder = ({ order }: Props) => {
	const products = order?.products || [];
	const productIds: string[] = products.map((product: IProduct) => product.productID);
	const uniqueProductIds = Array.from(new Set(productIds));
	const { data: shoesData, isLoading: shoesLoading } = useGetShoesBulkQuery(
		{ ids: uniqueProductIds, key: 'shoeID' },
		{ skip: uniqueProductIds.length === 0 }
	);

	// Create lookup map for O(1) access instead of O(N) find operations
	const shoeLookup = new Map<string, Shoe>();
	shoesData?.forEach((shoe: Shoe) => {
		shoeLookup.set(shoe.shoeID, shoe);
	});

	// Map each product to an object containing both shoe data and order data
	const orderedItems = products
		.map((product: IProduct) => {
			const shoe = shoeLookup.get(product.productID);
			if (!shoe) {
				return null;
			}

			return {
				shoe,
				product,
			};
		})
		.filter((item: any): item is { shoe: Shoe; product: IProduct } => item !== null);

	return (
		<div className="border border-gray-300 rounded-lg my-4 p-5 text-gray-800">
			<div className="flex justify-between mb-4 text-sm sm:flex-col sm:gap-3 gap-2">
				<div className="flex gap-10">
					<div>
						<div className="font-bold">ORDER PLACED</div>
						<div>{moment(order.orderDate).format('MMMM Do YYYY')}</div>
					</div>

					<div>
						<div className="font-bold">TOTAL</div>
						<div>${order.amount}.00</div>
					</div>
				</div>

				<div>
					<div className="font-bold">ORDER #{order._id}</div>
					<Link to={`/order-details/${order._id}`} className="text-blue-400 hover:underline">
						View order details
					</Link>
				</div>
			</div>

			{shoesLoading ? (
				<div className="flex justify-center py-4">
					<CircleLoader size={10} />
				</div>
			) : (
				<div className="space-y-1">
					{orderedItems?.map((item: { shoe: Shoe; product: IProduct }, index: number) => (
						<SmallOrderShoe key={`${item.shoe._id}-${index}`} item={item} />
					))}
				</div>
			)}
		</div>
	);
};

export default SmallOrder;
