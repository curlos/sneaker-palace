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
		<div className="w-1/2 sm:w-full sm:mt-8">
			<div className="text-2xl font-medium mb-4">Account Details</div>

			<form>
				<div className="mb-4">
					{file || user?.profilePic ? (
						<img
							src={
								file ? URL.createObjectURL(file) : `${user?.profilePic}`
							}
							alt=""
							className="h-150 w-150 rounded-full object-cover mb-3"
						/>
					) : (
						<img src={DEFAULT_AVATAR} alt="" className="h-150 w-150 rounded-full object-cover mb-3" />
					)}

					<input onChange={handleSelectFile} type="file" accept="image/*"></input>
				</div>

				<div className="mb-4">
					<div className="mb-1">First Name</div>
					<input
						type="text"
						placeholder="Email"
						className="rounded-lg w-full"
						value={firstName}
						onChange={(e) => setFirstName(e.target.value)}
					/>
				</div>

				<div className="mb-4">
					<div className="mb-1">Last Name</div>
					<input
						type="text"
						placeholder="Last Name"
						className="rounded-lg w-full"
						value={lastName}
						onChange={(e) => setLastName(e.target.value)}
					/>
				</div>

				<div className="mb-4">
					<div className="mb-1">Email</div>
					<input
						type="text"
						placeholder="Email"
						className="rounded-lg w-full"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
				</div>

				<div className="mb-4">
					<div className="mb-1">Password</div>
					<input
						type="password"
						placeholder="Password"
						className="rounded-lg w-full cursor-pointer"
						value={'*********'}
						onClick={() => setShowModal(true)}
						readOnly
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
