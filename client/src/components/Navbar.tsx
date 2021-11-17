import { MenuIcon, SearchIcon } from "@heroicons/react/solid";
import { ShoppingBagIcon } from "@heroicons/react/outline";
import { Link, useHistory, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { CartState, ICart, UserType } from "../types/types";
import { UserDropdown } from "./UserDropdown";
import { logout } from '../redux/userRedux'
import axios from "axios";
import { resetCart, updateCart } from "../redux/cartRedux";
import { useEffect } from "react";

interface Props {
  setShowSearchModal: React.Dispatch<React.SetStateAction<boolean>>
  setShowSidenavModal: React.Dispatch<React.SetStateAction<boolean>>
}

const Navbar = ({ setShowSearchModal, setShowSidenavModal }: Props) => {

  const user: Partial<UserType> = useSelector((state: RootState) => state.user && state.user.currentUser)
  const { currentCart, total } = useSelector((state: RootState) => state.cart)
  const dispatch = useDispatch()
  const history = useHistory()

  console.log(currentCart)

  const handleLogout = () => {
    console.log('log out')
    dispatch(logout())
    dispatch(resetCart())
    history.push('/')
    window.location.reload()
  }

  useEffect(() => {
    const fetchFromAPI = async () => {

      if (user && Object.keys(user).length > 0) {
        const response = await axios.get(`${process.env.REACT_APP_DEV_URL}/cart/find/${user?._id}`)
        const newCart = response.data
        dispatch(updateCart(newCart))
      } else {
        dispatch(resetCart())
      }
    }

    fetchFromAPI()
  }, [])

  console.log(user)

  return (
    <div className="sticky top-0 z-10 w-full bg-white flex justify-between items-center p-5 border-b border-gray-300">
      <div className="flex items-center w-6/12">
        <div><Link to="/">Shoe Shop</Link></div>
      </div>

      <div className="flex items-center gap-5">
        <Link to="/shoes" className="sm:hidden">Sneakers</Link>
        <div className="sm:hidden">
          <Link to={{ pathname: "/shoes", state: { gender: 'men' } }} onClick={() => setShowSidenavModal(false)}>Men</Link>
        </div>

        <div className="sm:hidden">
          <Link to={{ pathname: "/shoes", state: { gender: 'women' } }} onClick={() => setShowSidenavModal(false)}>Women</Link>
        </div>
        {user && Object.keys(user).length > 0 ? (
          <span>
            <UserDropdown user={user} handleLogout={handleLogout} />
          </span>)
          : (
            <span className="flex items-center gap-5">
              <Link to="/login" className="sm:hidden">Login</Link>
              <Link to="/register" className="sm:hidden">Sign Up</Link>
            </span>
          )}
        <SearchIcon className="h-5 w-5 cursor-pointer" onClick={() => setShowSearchModal(true)} />
        <Link to="/cart" className="inline-flex relative">
          <ShoppingBagIcon className="h-7 w-7" />
          <span className="z-10 inline-flex justify-center items-center text-white text-sm bg-red-800 h-5 w-5 border rounded-full absolute ml-4">{currentCart && currentCart.products && currentCart?.products?.length}</span>
        </Link>

        <MenuIcon className="h-5 w-5 cursor-pointer" onClick={() => setShowSidenavModal(true)} />
      </div>
    </div>
  )
}

export default Navbar;