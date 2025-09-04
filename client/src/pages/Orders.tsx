import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import SmallOrder from '../components/SmallOrder';
import { Pagination } from '../components/Pagination';
import { RootState } from '../redux/store';
import CircleLoader from '../skeleton_loaders/CircleLoader';
import { IOrder } from '../types/types';
import { useGetUserOrdersQuery } from '../api/ordersApi';

const ORDERS_PER_PAGE = 10;

const Orders = () => {
	const [currentPage, setCurrentPage] = useState(1);
	const ordersRef = useRef<HTMLDivElement>(null);
	const userId = useSelector((s: RootState) => s.user.currentUser?._id);

	const { data: orders, isLoading: loading } = useGetUserOrdersQuery(undefined, {
		skip: !userId,
	});

	// Pagination logic for orders
	const sortedOrders = [...(orders || [])]
		.filter((order: IOrder) => order.products.length > 0)
		.sort((a: IOrder, b: IOrder) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	const totalPages = Math.ceil(sortedOrders.length / ORDERS_PER_PAGE);
	const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
	const endIndex = startIndex + ORDERS_PER_PAGE;
	const paginatedOrders = sortedOrders.slice(startIndex, endIndex);

	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	return loading ? (
		<div className="flex justify-center p-10 h-screen">
			<CircleLoader size={16} />
		</div>
	) : (
		<div className="container mx-auto px-4 max-w-6xl flex-grow">
			<div ref={ordersRef} className="text-3xl py-5">Your Orders</div>
			{!orders || orders.length < 1 ? (
				<div className="text-base flex items-center gap-2">
					<div>No orders found</div>
					<button className="py-4 px-10 sm:px-2 bg-black text-white">
						<Link to="/shoes">Order shoes</Link>
					</button>
				</div>
			) : sortedOrders.length > 0 ? (
				<div>
					<div>
						{paginatedOrders.map((order: IOrder) => (
							<SmallOrder key={order._id} order={order} />
						))}
					</div>
					{sortedOrders.length > ORDERS_PER_PAGE && (
						<Pagination
							pageLimit={totalPages}
							dataLimit={ORDERS_PER_PAGE}
							currentPage={currentPage}
							setCurrentPage={setCurrentPage}
							totalItemCount={sortedOrders.length}
						/>
					)}
				</div>
			) : null}
		</div>
	);
};

export default Orders;
