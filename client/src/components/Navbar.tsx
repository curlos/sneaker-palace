import { SearchIcon } from "@heroicons/react/solid";
import { ShoppingBagIcon } from "@heroicons/react/outline";
import { Link, useParams } from 'react-router-dom'

const Navbar = () => {

  return (
    <div className="sticky top-0 z-50 w-full bg-white flex justify-between items-center p-5 border-b border-gray-300">
      <div className="flex items-center w-6/12">
        <div><Link to="/">Shoe Shop</Link></div>
        <div className="flex items-center border border-gray-400 rounded-lg mx-5 p-2 w-6/12">
          <SearchIcon className="h-5 w-5"/>
          <input className="w-6/12 focus:outline-none px-2" placeholder="Search"></input>
        </div>
      </div>
      
      <div className="flex items-center gap-5">
        <Link to="/shoes">Sneakers</Link>
        <Link to="/brands">Brands</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Sign Up</Link>
        <Link to="/cart" className="inline-flex relative">
          <ShoppingBagIcon className="h-7 w-7"/>
          <span className="z-10 inline-flex justify-center items-center text-white text-sm bg-emerald-500 h-5 w-5 border rounded-full absolute ml-4">5</span>
        </Link>
      </div>
    </div>
  )
}

export default Navbar;