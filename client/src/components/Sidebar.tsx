import { ChevronUpIcon } from "@heroicons/react/solid";

const Sidebar = () => {

  return (
    <aside className="h-screen sticky top-0 overflow-y-auto p-5 w-full flex-2">

      <div className="flex justify-between items-center bg-white">
        <span>Color</span> <ChevronUpIcon className="h-6 w-6"/>
      </div>

      <div className="flex justify-between items-center">
        <span>Brand</span> <ChevronUpIcon className="h-6 w-6"/>
      </div>

      <div className="flex justify-between items-center">
        <span>Gender</span> <ChevronUpIcon className="h-6 w-6"/>
      </div>

      <div className="flex justify-between items-center">
        <span>Shop by Price</span> <ChevronUpIcon className="h-6 w-6"/>
      </div>

      <div className="flex justify-between items-center">
        <span>Shop by Price</span> <ChevronUpIcon className="h-6 w-6"/>
      </div>

      <div className="flex justify-between items-center">
        <span>Shop by Price</span> <ChevronUpIcon className="h-6 w-6"/>
      </div>

      <div className="flex justify-between items-center">
        <span>Shop by Price</span> <ChevronUpIcon className="h-6 w-6"/>
      </div>

      <div className="flex justify-between items-center">
        <span>Shop by Price</span> <ChevronUpIcon className="h-6 w-6"/>
      </div>

      <div className="flex justify-between items-center">
        <span>Shop by Price</span> <ChevronUpIcon className="h-6 w-6"/>
      </div>
      
      <div className="flex justify-between items-center">
        <span>Shop by Price</span> <ChevronUpIcon className="h-6 w-6"/>
      </div>
    </aside>
  )
}

export default Sidebar;