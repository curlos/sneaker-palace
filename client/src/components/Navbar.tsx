import { SearchIcon } from "@heroicons/react/solid";
import { ShoppingBagIcon } from "@heroicons/react/outline";
import { Link, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { CartState, ICart, UserType } from "../types/types";
import { UserDropdown } from "./UserDropdown";
import { logout } from '../redux/userRedux'
import axios from "axios";
import { updateCart } from "../redux/cartRedux";
import { useEffect } from "react";

interface Props {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>
}

const Navbar = ({ setShowModal }: Props) => {

  const user: Partial<UserType> = useSelector((state: RootState) => state.user.currentUser)
  const cart: Partial<CartState> = useSelector((state: RootState) => state.cart.currentCart)
  const currentCart = cart?.currentCart
  const dispatch = useDispatch()
  
  const handleLogout = () => {
    console.log('log out')
    dispatch(logout())
  }

  useEffect(() => {
    const fetchFromAPI = async () => {
      const response = await axios.get(`http://localhost:8888/cart/find/${user?._id}`)
      const newCart = response.data
      dispatch(updateCart({currentCart: newCart}))
    }

    fetchFromAPI()
  }, [])

  console.log(user)
  console.log(currentCart)

  return (
    <div className="sticky top-0 z-10 w-full bg-white flex justify-between items-center p-5 border-b border-gray-300">
      <div className="flex items-center w-6/12">
        <div><Link to="/">Shoe Shop</Link></div>
      </div>
      
      <div className="flex items-center gap-5">
        <Link to="/shoes">Sneakers</Link>
        <Link to="/brands">Brands</Link>
        {user ? (
          <span>
            <UserDropdown user={user} handleLogout={handleLogout}/>
          </span> )
           : (
          <span className="flex items-center gap-5">
            <Link to="/login">Login</Link>
            <Link to="/register">Sign Up</Link>
          </span>
        )}
        <SearchIcon className="h-5 w-5 cursor-pointer" onClick={() => setShowModal(true)}/>
        <Link to="/cart" className="inline-flex relative">
          <ShoppingBagIcon className="h-7 w-7"/>
          <span className="z-10 inline-flex justify-center items-center text-white text-sm bg-emerald-500 h-5 w-5 border rounded-full absolute ml-4">{currentCart?.products?.length}</span>
        </Link>
      </div>
    </div>
  )
}

export default Navbar;