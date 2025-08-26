import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'
import { Fragment } from 'react'

interface Props {
  sortType: string,
  setSortType: React.Dispatch<React.SetStateAction<string>>
}

const classNames = (...classes: Array<string>) => {
  return classes.filter(Boolean).join(' ')
}

export const SortDropdown = ({ sortType, setSortType }: Props) => {

  return (
    <div className="flex justify-end">
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="flex items-center">
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
              <Menu.Item>
                {({ active }) => (
                  <span
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block px-4 py-2 text-sm cursor-pointer'
                    )}
                    onClick={() => setSortType('Newest')}
                  >
                    Newest
                  </span>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <span
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block px-4 py-2 text-sm cursor-pointer'
                    )}
                    onClick={() => setSortType('Oldest')}
                  >
                    Oldest
                  </span>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <span
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block px-4 py-2 text-sm cursor-pointer'
                    )}
                    onClick={() => setSortType('Price: High-Low')}
                  >
                    Price: High-Low
                  </span>
                )}
              </Menu.Item>

              <Menu.Item>
                {({ active }) => (
                  <span
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block px-4 py-2 text-sm cursor-pointer'
                    )}
                    onClick={() => setSortType('Price: Low-High')}
                  >
                    Price: Low-High
                  </span>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  )
}
