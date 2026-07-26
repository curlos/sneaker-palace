import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { BrowserRouter as Router, Redirect, Route, Switch, useLocation } from 'react-router-dom';
import { Footer } from './components/Footer';
import Navbar from './components/Navbar';
import SearchModal from './components/SearchModal';
import ShoppingCartModal from './components/ShoppingCartModal';
import SidenavModal from './components/SidenavModal';
import StripeContainer from './components/StripeContainer';
import Cart from './pages/Cart';
import CheckoutForm from './pages/CheckoutForm';
import FullShoePage from './pages/FullShoePage';
import Home from './pages/Home';
import Login from './pages/Login';
import OrderDetails from './pages/OrderDetails';
import Orders from './pages/Orders';
import PaymentSuccess from './pages/PaymentSuccess';
import ProductList from './pages/ProductList';
import Profile from './pages/Profile';
import Register from './pages/Register';
import ReviewForm from './pages/ReviewForm';
import Settings from './pages/Settings';
import { useGetLoggedInUserQuery } from './api/userApi';
import { RootState } from './redux/store';

const MainContent = ({ children }: { children: React.ReactNode }) => {
	const location = useLocation();
	const mainRef = useRef<HTMLElement>(null);
	const isFirstRender = useRef(true);

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		mainRef.current?.focus({ preventScroll: true });
	}, [location.pathname]);

	return (
		<main id="main-content" ref={mainRef} tabIndex={-1} className="flex-grow flex flex-col outline-none">
			{children}
		</main>
	);
};

const App = () => {
	const userId = useSelector((s: RootState) => s.user.currentUser?._id);
	const { data: user } = useGetLoggedInUserQuery(userId);
	const [showSearchModal, setShowSearchModal] = useState(false);
	const [showSidenavModal, setShowSidenavModal] = useState(false);
	const [showShoppingCartModal, setShowShoppingCartModal] = useState(false);

	return (
		<Router>
			<div className="m-0 box-border font-urbanist min-h-screen flex flex-col">
				<a
					href="#main-content"
					className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded"
				>
					Skip to main content
				</a>

				{showSearchModal ? (
					<SearchModal showSearchModal={showSearchModal} setShowSearchModal={setShowSearchModal} />
				) : null}

				{showSidenavModal ? (
					<SidenavModal showSidenavModal={showSidenavModal} setShowSidenavModal={setShowSidenavModal} />
				) : null}

				{showShoppingCartModal ? (
					<ShoppingCartModal showModal={showShoppingCartModal} setShowModal={setShowShoppingCartModal} />
				) : null}

				<Navbar setShowSearchModal={setShowSearchModal} setShowSidenavModal={setShowSidenavModal} />

				<MainContent>
					<Switch>
						<Route path="/login" exact>
							<Login />
						</Route>

						<Route path="/register" exact>
							{user ? (
								<Redirect to="/" />
							) : (
								<span>
									<Register />
								</span>
							)}
						</Route>

						<Route path="/cart" exact>
							<Cart />
						</Route>

						<Route path="/payment" exact>
							<StripeContainer children={<CheckoutForm />} />
						</Route>

						<Route path="/payment-success" exact>
							<StripeContainer children={<PaymentSuccess />} />
						</Route>

						<Route path="/shoes" exact>
							<ProductList />
						</Route>

						<Route path="/shoe/:shoeID" exact>
							<FullShoePage setShowShoppingCartModal={setShowShoppingCartModal} />
						</Route>

						<Route path="/shoe/submit-review/:shoeID" exact>
							{!user ? (
								<Redirect to="/login" />
							) : (
								<span>
									<ReviewForm />
								</span>
							)}
						</Route>

						<Route path="/shoe/edit-review/:shoeID/:reviewID" exact>
							{!user ? (
								<Redirect to="/login" />
							) : (
								<span>
									<ReviewForm />
								</span>
							)}
						</Route>

						<Route path="/profile/:userID" exact>
							<Profile />
						</Route>

						<Route path="/orders" exact>
							{!user ? (
								<Redirect to="/" />
							) : (
								<span>
									<Orders />
								</span>
							)}
						</Route>

						<Route path="/order-details/:id" exact>
							<OrderDetails />
						</Route>

						<Route path="/settings" exact>
							{!user ? (
								<Redirect to="/" />
							) : (
								<span>
									<Settings />
								</span>
							)}
						</Route>

						<Route path="/">
							<Home />
						</Route>
					</Switch>
				</MainContent>

				<Footer />
			</div>
		</Router>
	);
};

export default App;
