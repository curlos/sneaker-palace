import axios from 'axios'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid'

const App = () => {
  return (
    <div className="p-4 flex justify-between text-base">
      <div className="inline-flex items-center text-base text-gray-700">Showing 1 to 10 of 97 results</div>

      <div className="flex">
        <a className="inline-flex items-center text-gray-600 border border-r-0 border-gray-300 rounded-l-lg px-3 py-2 hover:bg-gray-50 cursor-pointer">
          <ChevronLeftIcon className="h-5 w-5"/>
        </a>

        <a className="z-10 inline-flex items-center bg-indigo-50 border border-indigo-500 text-indigo-600 px-4 py-2 hover:bg-indigo-100 cursor-pointer">
          1
        </a>

        <a className="z-10 inline-flex items-center border border-r-0 border-gray-300 text-gray-500 px-4 py-2 hover:bg-gray-50 cursor-pointer">
          2
        </a>

        <a className="z-10 inline-flex items-center border border-r-0 border-gray-300 text-gray-500 px-4 py-2 hover:bg-gray-50 cursor-pointer">
          3
        </a>

        <a className="z-10 inline-flex items-center border border-r-0 border-gray-300 text-gray-500 px-4 py-2 hover:bg-gray-50 cursor-pointer">
          ...
        </a>

        <a className="z-10 inline-flex items-center border border-r-0 border-gray-300 text-gray-500 px-4 py-2 hover:bg-gray-50 cursor-pointer">
          8
        </a>

        <a className="z-10 inline-flex items-center border border-r-0 border-gray-300 text-gray-500 px-4 py-2 hover:bg-gray-50 cursor-pointer">
          9
        </a>

        <a className="z-10 inline-flex items-center border border-r-0 border-gray-300 text-gray-500 px-4 py-2 hover:bg-gray-50 cursor-pointer">
          10
        </a>

        <a className="inline-flex items-center text-gray-600 border border-gray-300 rounded-r-lg px-3 py-2 hover:bg-gray-50">
          <ChevronRightIcon className="h-5 w-5"/>
        </a>
      </div>

      
    </div>

  );
}

export default App;
