import { SearchIcon } from '@heroicons/react/outline';
import React, { useEffect, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useModalA11y } from '../hooks/useModalA11y';
import SmallProductList from './SmallProductList';

interface Props {
	showSearchModal: boolean;
	setShowSearchModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const SearchModal = ({ showSearchModal, setShowSearchModal }: Props) => {
	const history = useHistory();
	const location = useLocation();
	
	// Get query param from URL if on /shoes page
	const getInitialSearchText = () => {
		if (location.pathname === '/shoes') {
			const urlParams = new URLSearchParams(location.search);
			const query = urlParams.get('query');
			return query?.trim() || '';
		}
		return '';
	};
	
	const [searchText, setSearchText] = useState(() => getInitialSearchText());
	const [finalSearchText, setFinalSearchText] = useState(() => getInitialSearchText());
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleBubblingDownClick = (e: React.FormEvent) => {
		e.stopPropagation();
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		history.push(`/shoes?query=${encodeURIComponent(searchText)}`);
		setShowSearchModal(false);
	};

	useEffect(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		timeoutRef.current = setTimeout(() => {
			setFinalSearchText(searchText);
		}, 500);

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [searchText]);

	const dialogRef = useModalA11y(() => setShowSearchModal(false));

	// Focus the input when modal opens (runs after useModalA11y's initial focus, so it takes priority)
	useEffect(() => {
		if (showSearchModal && inputRef.current) {
			inputRef.current.focus();
		}
	}, [showSearchModal]);

	return (
		// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
		<div
			className="fixed z-20 w-screen h-screen bg-black bg-opacity-40"
			onClick={() => setShowSearchModal(!showSearchModal)}
		>
			{/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-element-interactions */}
			<aside
				ref={dialogRef}
				role="dialog"
				aria-modal="true"
				aria-label="Search"
				className={`transform z-30 top-0 right-0 w-96 bg-white text-black fixed h-full overflow-y-scroll sm:no-scrollbar ease-in-out transition-all duration-1000 ${showSearchModal ? 'translate-x-0' : 'translate-x-full'} sm:w-10/12`}
				onClick={handleBubblingDownClick}
				style={{scrollbarWidth: 'thin'}}
			>
				<form onSubmit={handleSubmit} className="border-0 border-b border-solid border-gray-300">
					<div className="flex p-4 py-6">
						<button type="submit" aria-label="Search">
							<SearchIcon className="h-7 w-7 text-gray-600" aria-hidden="true" />
						</button>
						<label htmlFor="search-input" className="sr-only">
							Search
						</label>
						<input
							ref={inputRef}
							id="search-input"
							type="text"
							autoComplete="off"
							className="ml-5 placeholder-gray-600 placeholder-opacity-100 focus:outline-none focus:ring-2 focus:ring-black uppercase text-lg font-medium w-full"
							placeholder="TYPE TO SEARCH"
							value={searchText}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.currentTarget.value)}
						/>
					</div>
					{finalSearchText && (
						<div className="px-4 pb-4">
							<button 
								type="submit"
								className="bg-black text-white py-3 px-4 font-medium hover:bg-gray-800 transition-colors"
							>
								VIEW FULL RESULTS
							</button>
						</div>
					)}
				</form>

				<SmallProductList
					finalSearchText={finalSearchText}
					setShowModal={setShowSearchModal}
				/>
			</aside>
		</div>
	);
};

export default SearchModal;
