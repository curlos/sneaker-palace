import { ShoppingBagIcon } from "@heroicons/react/outline";
import { MenuIcon, SearchIcon } from "@heroicons/react/solid";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from 'react-router-dom';
import { resetCart, updateCart } from "../redux/cartRedux";
import { RootState } from "../redux/store";
import { logout } from '../redux/userRedux';
import { UserType } from "../types/types";
import { UserDropdown } from "./UserDropdown";

interface Props {
  setShowSearchModal: React.Dispatch<React.SetStateAction<boolean>>
  setShowSidenavModal: React.Dispatch<React.SetStateAction<boolean>>
}

const Navbar = ({ setShowSearchModal, setShowSidenavModal }: Props) => {

  const user: Partial<UserType> = useSelector((state: RootState) => state.user && state.user.currentUser)
  const { currentCart } = useSelector((state: RootState) => state.cart)
  const dispatch = useDispatch()
  const history = useHistory()

  const handleLogout = () => {

    dispatch(logout())
    dispatch(resetCart())
    history.push('/')
  }

  useEffect(() => {
    const fetchFromAPI = async () => {

      if (user && Object.keys(user).length > 0) {
        const response = await axios.get(`${process.env.REACT_APP_DEV_URL}/cart/find/${user?._id}`)
        const newCart = response.data
        dispatch(updateCart(newCart))
      } else if (localStorage.getItem('currentCart')) {
        const newCart = localStorage.getItem('currentCart')

        if (newCart) {
          dispatch(updateCart(newCart))
        }

      } else {
        dispatch(resetCart())
      }
    }

    fetchFromAPI()
  }, [dispatch, user])



  return (
    <div className="sticky top-0 z-10 w-full bg-white flex justify-between items-center p-4 border-b border-gray-300">
      <div className="flex items-center w-6/12">
        <div><Link to="/"><img src="/assets/icon.png" className="h-10 w-10" alt="" /></Link></div>
      </div>

      <div className="flex items-center gap-5">
        <Link to="/shoes" className="lg:hidden">Sneakers</Link>
        <div className="lg:hidden">
          <Link to={{ pathname: "/shoes", state: { gender: 'men' } }} onClick={() => setShowSidenavModal(false)}>Men</Link>
        </div>

        <div className="lg:hidden">
          <Link to={{ pathname: "/shoes", state: { gender: 'women' } }} >Women</Link>
        </div>
        {user && Object.keys(user).length > 0 ? (
          <span>
            <UserDropdown user={user} handleLogout={handleLogout} />
          </span>)
          : (
            <span className="flex items-center gap-5">
              <Link to="/login" className="lg:hidden">Login</Link>
              <Link to="/register" className="lg:hidden">Sign Up</Link>
            </span>
          )}
        <SearchIcon className="h-5 w-5 cursor-pointer" onClick={() => setShowSearchModal(true)} />
        <Link to="/cart" className="inline-flex relative">
          <ShoppingBagIcon className="h-7 w-7" />
          <span className="z-10 inline-flex justify-center items-center text-white text-sm bg-red-800 h-5 w-5 border rounded-full absolute ml-4">{currentCart && currentCart.products && currentCart?.products?.length}</span>
        </Link>

        <MenuIcon className="h-5 w-5 cursor-pointer hidden lg:block" onClick={() => setShowSidenavModal(true)} />
      </div>
    </div>
  )
}

export default Navbar;