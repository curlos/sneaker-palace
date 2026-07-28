import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import { loginFailure } from '../redux/userRedux';
import { performLogin } from '../utils/authUtils';
import { useUpdateGuestCartMutation } from '../api/cartApi';

const Login = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState(false);
	const dispatch = useDispatch();
	const history = useHistory();
	const [updateGuestCart] = useUpdateGuestCartMutation();

	useEffect(() => {
		window.scrollTo(0, 0);
	});

	const handleLoginUser = async (e: React.FormEvent) => {
		setError(false);
		e.preventDefault();

		try {
			await performLogin(email, password, dispatch, updateGuestCart);
			history.push('/');
		} catch (err) {
			setError(true);
			dispatch(loginFailure());
		}
	};

	return (
		<form className="h-screen bg-cover flex justify-center items-start" onSubmit={handleLoginUser} style={{ backgroundImage: 'url(/assets/upscaled-images/bg-login-image.webp)'}}>
			<div className="flex flex-col gap-4 items-center bg-white p-4 rounded-lg my-6 max-xl:py-10 max-sm:w-[97%] shadow-2xl shadow-black border border-gray-300 w-2/5 container mx-auto max-w-7xl">
				<h1 className="font-bold text-2xl">YOUR ACCOUNT FOR EVERYTHING</h1>
				<label htmlFor="login-email" className="sr-only">
					Email address
				</label>
				<input
					id="login-email"
					type="email"
					required
					autoComplete="email"
					placeholder="Email address"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					aria-invalid={error}
					aria-describedby={error ? 'login-error' : undefined}
					className={`rounded-lg p-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-black ${error ? 'border-red-600 border-2' : 'border border-gray-300'}`}
				></input>
				<label htmlFor="login-password" className="sr-only">
					Password
				</label>
				<input
					id="login-password"
					type="password"
					required
					autoComplete="current-password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					aria-invalid={error}
					aria-describedby={error ? 'login-error' : undefined}
					className={`rounded-lg p-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-black ${error ? 'border-red-600 border-2' : 'border border-gray-300'}`}
				></input>

				<button
					type="submit"
					className="bg-black text-white w-full py-2 rounded-lg hover:bg-gray-600"
					onClick={handleLoginUser}
				>
					SIGN IN
				</button>
				{error ? (
					<span id="login-error" role="alert" className="text-red-600">
						Invalid credentials!
					</span>
				) : null}
				<span className="text-gray-500">
					Not a member?{' '}
					<Link to="/register" className="text-black underline">
						Sign up.
					</Link>
				</span>
			</div>
		</form>
	);
};

export default Login;
