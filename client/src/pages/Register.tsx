import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import { performLogin } from '../utils/authUtils';
import { useUpdateGuestCartMutation } from '../api/cartApi';

const Register = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [error, setError] = useState(false);
	const [errorMessage, setErrorMessage] = useState('All fields must be filled out!');
	const history = useHistory();
	const dispatch = useDispatch();
	const [updateGuestCart] = useUpdateGuestCartMutation();

	useEffect(() => {
		window.scrollTo(0, 0);
	});

	const handleRegisterUser = async (e: React.FormEvent) => {
		setError(false);
		setErrorMessage('All fields must be filled out!');
		e.preventDefault();

		const body = {
			email,
			password,
			firstName,
			lastName,
		};

		try {
			const response = await axios.post(`${import.meta.env.VITE_DEV_URL}/auth/register`, body);

			if (response.data.error) {
				setError(true);
				setErrorMessage(response.data.error);
			} else {
				// Auto-login the user after successful registration
				await performLogin(email, password, dispatch, updateGuestCart);
				history.push('/');
			}
		} catch (err: any) {
			setError(true);
			// Extract error message from axios error response if available
			if (err.response?.data?.error) {
				setErrorMessage(err.response.data.error);
			} else {
				setErrorMessage('Registration failed. Please try again.');
			}
		}
	};

	return (
		<form
			className="h-screen bg-cover flex justify-center items-start"
			onSubmit={handleRegisterUser}
			style={{ backgroundImage: 'url(/assets/upscaled-images/bg-login-image.webp)'}}
		>
			<div className="flex flex-col gap-4 items-center bg-white p-4 rounded-lg my-6 max-xl:py-10 max-sm:w-[97%] shadow-2xl shadow-black border border-gray-300 w-2/5 container mx-auto max-w-7xl">
				<h1 className="font-bold text-2xl">BECOME A MEMBER</h1>
				<label htmlFor="register-email" className="sr-only">
					Email address
				</label>
				<input
					id="register-email"
					type="email"
					required
					autoComplete="email"
					placeholder="Email address"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					aria-invalid={error}
					aria-describedby={error ? 'register-error' : undefined}
					className={`rounded-lg p-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-black ${error ? 'border-red-600 border-2' : 'border border-gray-300'}`}
				></input>
				<label htmlFor="register-password" className="sr-only">
					Password
				</label>
				<input
					id="register-password"
					type="password"
					required
					autoComplete="new-password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					aria-invalid={error}
					aria-describedby={error ? 'register-error' : undefined}
					className={`rounded-lg p-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-black ${error ? 'border-red-600 border-2' : 'border border-gray-300'}`}
				></input>
				<label htmlFor="register-first-name" className="sr-only">
					First Name
				</label>
				<input
					id="register-first-name"
					type="text"
					required
					autoComplete="given-name"
					placeholder="First Name"
					value={firstName}
					onChange={(e) => setFirstName(e.target.value)}
					aria-invalid={error}
					aria-describedby={error ? 'register-error' : undefined}
					className={`rounded-lg p-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-black ${error ? 'border-red-600 border-2' : 'border border-gray-300'}`}
				></input>
				<label htmlFor="register-last-name" className="sr-only">
					Last Name
				</label>
				<input
					id="register-last-name"
					type="text"
					required
					autoComplete="family-name"
					placeholder="Last Name"
					value={lastName}
					onChange={(e) => setLastName(e.target.value)}
					aria-invalid={error}
					aria-describedby={error ? 'register-error' : undefined}
					className={`rounded-lg p-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-black ${error ? 'border-red-600 border-2' : 'border border-gray-300'}`}
				></input>

				{error ? (
					<span id="register-error" role="alert" className="text-red-600">
						{errorMessage}
					</span>
				) : null}

				<button
					type="submit"
					className="bg-black text-white w-full py-2 rounded-lg hover:bg-gray-600"
					onClick={handleRegisterUser}
				>
					SIGN UP
				</button>
				<span className="text-gray-500">
					Already a member?{' '}
					<Link to="/login" className="text-black underline">
						Log in.
					</Link>
				</span>
			</div>
		</form>
	);
};

export default Register;
