import { XIcon } from '@heroicons/react/outline';
import React, { useState, useRef, useEffect } from 'react';
import { useUpdateUserPasswordMutation } from '../api/userApi';
import { useModalA11y } from '../hooks/useModalA11y';
import FailureMessage from './FailureMessage';
import SuccessMessage from './SuccessMessage';

interface Props {
	showModal: boolean;
	setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const NewPasswordModal = ({ showModal, setShowModal }: Props) => {
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmNewPassword, setConfirmNewPassword] = useState('');

	const [updateUserPassword, { isLoading }] = useUpdateUserPasswordMutation();
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

	const handleBubblingDownClick = (e: React.FormEvent) => {
		e.stopPropagation();
	};

	const handleEditPassword = async (e: React.FormEvent) => {
		e.preventDefault();

		// Basic validation
		if (!currentPassword || !newPassword) {
			setShowFailureMessage(true);
			timeoutRef.current = setTimeout(() => setShowFailureMessage(false), 3000);
			return;
		}

		if (newPassword.length < 8) {
			setShowFailureMessage(true);
			timeoutRef.current = setTimeout(() => setShowFailureMessage(false), 3000);
			return;
		}

		if (newPassword !== confirmNewPassword) {
			setShowFailureMessage(true);
			timeoutRef.current = setTimeout(() => setShowFailureMessage(false), 3000);
			return;
		}

		const body = {
			currentPassword,
			newPassword,
		};

		try {
			await updateUserPassword({
				body,
			}).unwrap();

			// Show success message and auto-dismiss after 3 seconds
			setShowSuccessMessage(true);
			timeoutRef.current = setTimeout(() => {
				setShowSuccessMessage(false);
				setShowModal(false);
			}, 3000);

			// Clear form fields
			setCurrentPassword('');
			setNewPassword('');
			setConfirmNewPassword('');
		} catch (error) {
			console.error('Failed to update password:', error);

			// Show error message and auto-dismiss after 3 seconds
			setShowFailureMessage(true);
			timeoutRef.current = setTimeout(() => setShowFailureMessage(false), 3000);
		}
	};

	const dialogRef = useModalA11y<HTMLFormElement>(() => setShowModal(false));

	return (
		// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
		<div
			className="fixed z-20 w-screen h-screen bg-black bg-opacity-40 p-0 sm:p-8 md:p-16 lg:p-24 top-0 left-0 flex justify-center items-center"
			onClick={() => setShowModal(!showModal)}
		>
			{/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-element-interactions */}
			<form
				ref={dialogRef}
				role="dialog"
				aria-modal="true"
				aria-label="Edit Password"
				className="w-full sm:w-full md:w-4/5 lg:w-3/5 xl:w-1/2 2xl:w-2/5 max-w-none lg:max-w-lg max-h-screen md:h-auto lg:h-4/5 xl:h-3/5 mx-0 sm:mx-0 lg:mx-8 xl:mx-auto bg-white rounded-lg md:rounded-2xl lg:rounded-3xl p-3 md:p-6 lg:p-8 xl:p-12 placeholder-gray-400 overflow-y-auto"
				onClick={handleBubblingDownClick}
			>
				<div className="flex justify-between text-lg mb-4">
					<div className="font-bold">Edit Password</div>
					<button type="button" aria-label="Close" onClick={() => setShowModal(false)}>
						<XIcon className="h-5 w-5 text-gray-600 hover:text-gray-800 cursor-pointer" aria-hidden="true" />
					</button>
				</div>
				<label htmlFor="current-password">Current Password</label>
				<input
					id="current-password"
					type="password"
					required
					autoComplete="current-password"
					className="w-full rounded-lg mb-4 placeholder-gray-600"
					placeholder="Current Password"
					value={currentPassword}
					onChange={(e) => setCurrentPassword(e.target.value)}
					onClick={handleBubblingDownClick}
				></input>
				<label htmlFor="new-password">New Password</label>
				<input
					id="new-password"
					type="password"
					required
					autoComplete="new-password"
					className="w-full rounded-lg mb-4 placeholder-gray-600"
					placeholder="New Password"
					value={newPassword}
					onChange={(e) => setNewPassword(e.target.value)}
					onClick={handleBubblingDownClick}
				></input>

				<label htmlFor="confirm-new-password">Confirm New Password</label>
				<input
					id="confirm-new-password"
					type="password"
					required
					autoComplete="new-password"
					className="w-full rounded-lg mb-4 placeholder-gray-600"
					placeholder="Confirm New Password"
					value={confirmNewPassword}
					onChange={(e) => setConfirmNewPassword(e.target.value)}
					onClick={handleBubblingDownClick}
				></input>

				{showSuccessMessage && (
					<SuccessMessage setShowMessage={setShowSuccessMessage} message={'Password updated!'} />
				)}
				{showFailureMessage && (
					<FailureMessage
						setShowMessage={setShowFailureMessage}
						message={'Password not updated, error occurred!'}
					/>
				)}

				<div className="flex justify-end">
					<button
						type="button"
						onClick={handleEditPassword}
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

export default NewPasswordModal;
