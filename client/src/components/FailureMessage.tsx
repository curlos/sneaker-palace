import React from 'react';
import { XIcon } from '@heroicons/react/solid';

interface Props {
	setShowMessage: React.Dispatch<React.SetStateAction<boolean>>;
	message: string;
}

const FailureMessage = ({ setShowMessage, message }: Props) => {
	return (
		<div role="alert" className="p-3 bg-red-200 text-red-800 w-full border border-red-600 rounded-lg my-3">
			<div className="flex justify-between items-center text-lg">
				<div>{message}</div>
				<button type="button" aria-label="Dismiss" onClick={() => setShowMessage(false)}>
					<XIcon className="h-5 w-5 text-gray-600 hover:text-gray-800 cursor-pointer" aria-hidden="true" />
				</button>
			</div>
		</div>
	);
};

export default FailureMessage;
