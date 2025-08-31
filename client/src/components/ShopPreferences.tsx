import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import FailureMessage from './FailureMessage';
import SuccessMessage from './SuccessMessage';
import * as short from 'short-uuid';
import { useGetLoggedInUserQuery, useUpdateUserInfoMutation } from '../api/userApi';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { SHOE_SIZES, AVERAGE_SHOE_SIZE } from '../utils/shoeConstants';

const ShopPreferences = () => {
	const userId = useSelector((s: RootState) => s.user.currentUser?._id);
	const { data: user } = useGetLoggedInUserQuery(userId);

	const [preselectedShoeSize, setPreselectedShoeSize] = useState(user?.preselectedShoeSize || AVERAGE_SHOE_SIZE);
	const [preferredGender, setPreferredGender] = useState(user?.preferredGender || 'men');
	const [unitOfMeasure, setUnitOfMeasure] = useState(user?.unitOfMeasure || 'imperial');

	const [updateUserInfo, { isLoading }] = useUpdateUserInfoMutation();
	const [showSuccessMessage, setShowSuccessMessage] = useState(false);
	const [showFailureMessage, setShowFailureMessage] = useState(false);

	// Keep track of timeouts
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	const handleEdit = async (e: React.FormEvent) => {
		e.preventDefault();

		const body = {
			preselectedShoeSize,
			preferredGender,
			unitOfMeasure,
		};

		try {
			await updateUserInfo({
				body,
			}).unwrap();

			// Show success message and auto-dismiss after 3 seconds
			setShowSuccessMessage(true);
			timeoutRef.current = setTimeout(() => setShowSuccessMessage(false), 3000);
		} catch (error) {
			console.error('Failed to update user preferences:', error);

			// Show error message and auto-dismiss after 3 seconds
			setShowFailureMessage(true);
			timeoutRef.current = setTimeout(() => setShowFailureMessage(false), 3000);
		}
	};

	return (
		<div className="w-1/2 sm:w-full sm:mt-8">
			<div className="text-2xl font-medium mb-4">Shop Preferences</div>

			<form>
				<div className="mb-4">
					<div className="mb-1 font-medium w-full">Shoe Size</div>
					<select
						name="shoeSizes"
						className="border-gray-500 rounded-lg text-black w-full"
						value={preselectedShoeSize}
						onChange={(e: ChangeEvent<HTMLSelectElement>) => setPreselectedShoeSize(e.currentTarget.value)}
					>
						{SHOE_SIZES.map((shoeSize) => (
							<option key={`${shoeSize}-${short.generate()}`} value={shoeSize}>
								{shoeSize}
							</option>
						))}
					</select>
					<div className="text-gray-500 text-sm">
						Provide your shoe size to have it preselected when you shop.
					</div>
				</div>

				<div className="mb-4">
					<div className="font-medium mb-3">Preferred Shop Settings</div>

					<div className="flex items-center mb-2">
						<input
							name="gender"
							type="radio"
							value="Yes"
							className="mr-2 h-5 w-5"
							checked={preferredGender === 'women'}
							onChange={() => setPreferredGender('women')}
						/>
						<label>Women's</label>
					</div>

					<div className="flex items-center mb-2">
						<input
							name="gender"
							type="radio"
							value="Yes"
							className="mr-2 h-5 w-5"
							checked={preferredGender === 'men'}
							onChange={() => setPreferredGender('men')}
						/>
						<label>Men's</label>
					</div>
				</div>

				<div className="mb-4">
					<div className="font-medium mb-3">Unit of Measure</div>

					<div className="flex items-center mb-2">
						<input
							name="unitOfMeasure"
							type="radio"
							value="Yes"
							className="mr-2 h-5 w-5"
							checked={unitOfMeasure === 'metric'}
							onChange={() => setUnitOfMeasure('metric')}
						/>
						<label>Metric</label>
					</div>

					<div className="flex items-center mb-2">
						<input
							name="unitOfMeasure"
							type="radio"
							value="Yes"
							className="mr-2 h-5 w-5"
							checked={unitOfMeasure === 'imperial'}
							onChange={() => setUnitOfMeasure('imperial')}
						/>
						<label>Imperial</label>
					</div>
				</div>

				{showSuccessMessage && (
					<SuccessMessage setShowMessage={setShowSuccessMessage} message={'Settings updated!'} />
				)}
				{showFailureMessage && (
					<FailureMessage
						setShowMessage={setShowFailureMessage}
						message={'Settings not updated, error occurred!'}
					/>
				)}

				<div className="flex justify-end">
					<button
						onClick={handleEdit}
						disabled={isLoading}
						className="bg-black text-white rounded-full py-3 my-5 hover:bg-gray-700 px-5 py-3 disabled:opacity-50"
					>
						{isLoading ? 'Saving...' : 'Save'}
					</button>
				</div>
			</form>
		</div>
	);
};

export default ShopPreferences;
