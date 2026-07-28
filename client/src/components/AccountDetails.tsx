import { ChangeEvent, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { postImage } from '../utils/postImage';
import { DEFAULT_AVATAR } from '../utils/userConstants';
import FailureMessage from './FailureMessage';
import NewPasswordModal from './NewPasswordModal';
import SuccessMessage from './SuccessMessage';
import { useGetLoggedInUserQuery, useUpdateUserInfoMutation } from '../api/userApi';

const AccountDetails = () => {
	const userId = useSelector((s: RootState) => s.user.currentUser?._id);
	const { data: user } = useGetLoggedInUserQuery(userId);
	const [firstName, setFirstName] = useState(user?.firstName);
	const [lastName, setLastName] = useState(user?.lastName);
	const [email, setEmail] = useState(user?.email);
	const [file, setFile] = useState<File>();

	const [showSuccessMessage, setShowSuccessMessage] = useState(false);
	const [showFailureMessage, setShowFailureMessage] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [showModal, setShowModal] = useState(false);

	const [updateUserInfo, { isLoading }] = useUpdateUserInfoMutation();

	// Keep track of timeouts
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const handleEdit = async () => {
		let profilePicObj = user?.profilePic;

		if (file) {
			const results = await postImage(file);

			profilePicObj = results.imagePath;
		}

		const body = {
			firstName,
			lastName,
			email,
			profilePic: profilePicObj,
		};

		try {
			await updateUserInfo({
				body,
			}).unwrap();

			// Show success message and auto-dismiss after 3 seconds
			setShowSuccessMessage(true);
			timeoutRef.current = setTimeout(() => setShowSuccessMessage(false), 3000);
		} catch (error: any) {
			console.error('Failed to update user preferences:', error);

			// Extract error message from backend response or use default
			const backendErrorMessage = error?.data?.error || 'Settings not updated, error occurred!';
			setErrorMessage(backendErrorMessage);

			// Show error message and auto-dismiss after 3 seconds
			setShowFailureMessage(true);
			timeoutRef.current = setTimeout(() => setShowFailureMessage(false), 3000);
		}
	};

	const handleSelectFile = (e: ChangeEvent) => {
		const target = e.target as HTMLInputElement;
		const file: File = (target.files as FileList)[0];
		setFile(file);
	};

	return (
		<div className="w-1/2 max-sm:w-full max-sm:mt-8">
			<h2 className="text-2xl font-medium mb-4">Account Details</h2>

			<form>
				<div className="mb-4">
					{file || user?.profilePic ? (
						<img
							src={
								file ? URL.createObjectURL(file) : `${user?.profilePic}`
							}
							alt=""
							className="h-[150px] w-[150px] rounded-full object-cover mb-3"
						/>
					) : (
						<img src={DEFAULT_AVATAR} alt="" className="h-[150px] w-[150px] rounded-full object-cover mb-3" />
					)}

					<label htmlFor="account-profile-pic" className="mb-1 block">Profile Picture</label>
					<input id="account-profile-pic" onChange={handleSelectFile} type="file" accept="image/*" className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-400 file:text-sm file:font-medium file:bg-gray-200 file:text-gray-800 hover:file:bg-gray-300"></input>
				</div>

				<div className="mb-4">
					<label htmlFor="account-first-name" className="mb-1 block">First Name</label>
					<input
						id="account-first-name"
						type="text"
						required
						autoComplete="given-name"
						placeholder="First Name"
						className="rounded-lg w-full"
						value={firstName}
						onChange={(e) => setFirstName(e.target.value)}
					/>
				</div>

				<div className="mb-4">
					<label htmlFor="account-last-name" className="mb-1 block">Last Name</label>
					<input
						id="account-last-name"
						type="text"
						required
						autoComplete="family-name"
						placeholder="Last Name"
						className="rounded-lg w-full"
						value={lastName}
						onChange={(e) => setLastName(e.target.value)}
					/>
				</div>

				<div className="mb-4">
					<label htmlFor="account-email" className="mb-1 block">Email</label>
					<input
						id="account-email"
						type="email"
						required
						autoComplete="email"
						placeholder="Email"
						className="rounded-lg w-full"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
				</div>

				<div className="mb-4">
					<label htmlFor="account-password" className="mb-1 block">Password</label>
					<input
						id="account-password"
						type="text"
						role="button"
						readOnly
						value="*********"
						className="rounded-lg w-full cursor-pointer"
						onClick={() => setShowModal(true)}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								setShowModal(true);
							}
						}}
					/>
				</div>
			</form>

			{showSuccessMessage ? (
				<SuccessMessage setShowMessage={setShowSuccessMessage} message={'Settings updated!'} />
			) : null}
			{showFailureMessage ? (
				<FailureMessage setShowMessage={setShowFailureMessage} message={errorMessage} />
			) : null}

			<div className="flex justify-end">
				<button
					type="button"
					onClick={handleEdit}
					disabled={isLoading}
					className="bg-black text-white rounded-full py-3 my-5 hover:bg-gray-700 px-5 py-3 disabled:opacity-50"
				>
					{isLoading ? 'Saving...' : 'Save'}
				</button>
			</div>

			{showModal ? <NewPasswordModal showModal={showModal} setShowModal={setShowModal} /> : null}
		</div>
	);
};

export default AccountDetails;
