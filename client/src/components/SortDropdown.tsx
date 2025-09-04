import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/solid';
import { Fragment } from 'react';

interface Props {
	sortType: string;
	setSortType: (sortType: string) => void;
}

interface SortMenuItemProps {
	sortValue: string;
	displayText: string;
	setSortType: (sortType: string) => void;
}

const classNames = (...classes: Array<string>) => {
	return classes.filter(Boolean).join(' ');
};

const SortMenuItem = ({ sortValue, displayText, setSortType }: SortMenuItemProps) => (
	<Menu.Item>
		{({ active }) => (
			<span
				className={classNames(
					active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
					'block px-4 py-2 text-sm cursor-pointer'
				)}
				onClick={() => setSortType(sortValue)}
			>
				{displayText}
			</span>
		)}
	</Menu.Item>
);

export const SortDropdown = ({ sortType, setSortType }: Props) => {
	const sortOptions = [
		{ value: 'Newest Arrivals', label: 'Newest Arrivals' },
		{ value: 'Most Popular', label: 'Most Popular' },
		{ value: 'Highest Rated', label: 'Highest Rated' },
		{ value: 'Most Reviewed', label: 'Most Reviewed' },
		{ value: 'Most Relevant', label: 'Most Relevant' },
		{ value: 'Price: Low to High', label: 'Price: Low to High' },
		{ value: 'Price: High to Low', label: 'Price: High to Low' },
		{ value: 'Classic Releases', label: 'Classic Releases' },
	];

	return (
		<div className="flex justify-end">
			<Menu as="div" className="relative inline-block text-left">
				<div>
					<Menu.Button className="flex items-center border border-gray-300 p-2 rounded-full">
						{sortType} <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
					</Menu.Button>
				</div>

				<Transition
					as={Fragment}
					enter="transition ease-out duration-100"
					enterFrom="transform opacity-0 scale-95"
					enterTo="transform opacity-100 scale-100"
					leave="transition ease-in duration-75"
					leaveFrom="transform opacity-100 scale-100"
					leaveTo="transform opacity-0 scale-95"
				>
					<Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
						<div className="py-1">
							{sortOptions.map((option) => (
								<SortMenuItem
									key={option.value}
									sortValue={option.value}
									displayText={option.label}
									setSortType={setSortType}
								/>
							))}
						</div>
					</Menu.Items>
				</Transition>
			</Menu>
		</div>
	);
};
