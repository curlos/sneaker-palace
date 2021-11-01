import { SearchIcon } from "@heroicons/react/solid";

const Navbar = () => {

  return (
    <div className="flex justify-between items-center p-5 border-b border-gray-300">
      <div className="flex items-center w-6/12">
        <div>Shoe Shop</div>
        <div className="flex items-center border border-gray-400 rounded-lg mx-5 p-2 w-6/12">
          <SearchIcon className="h-5 w-5"/>
          <input className="w-6/12 focus:outline-none px-2" placeholder="Search"></input>
        </div>
      </div>
      
      <div className="flex gap-x-4">
        <span>Sneakers</span>
        <span>Brands</span>
        <span>Login</span>
        <span>Sign Up</span>
      </div>
    </div>
  )
}

export default Navbar;