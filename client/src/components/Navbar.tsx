import { ShoppingBagIcon } from "@heroicons/react/outline";
import { MenuIcon, SearchIcon } from "@heroicons/react/solid";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from 'react-router-dom';
import { useCart } from "../api/cartApi";
import { RootState } from "../redux/store";
import { logout } from '../redux/userRedux';
import { UserDropdown } from "./UserDropdown";
import { baseAPI } from "../api/api";
import { useGetLoggedInUserQuery } from "../api/userApi";

interface Props {
  setShowSearchModal: React.Dispatch<React.SetStateAction<boolean>>
  setShowSidenavModal: React.Dispatch<React.SetStateAction<boolean>>
}

const Navbar = ({ setShowSearchModal, setShowSidenavModal }: Props) => {

  const userId = useSelector((s: RootState) => s.user.currentUser?._id);
  const { data: user } = useGetLoggedInUserQuery(userId);
  const dispatch = useDispatch()
  const history = useHistory()

  // Unified cart hook - handles both logged-in and guest users automatically
  const { data: cartData } = useCart()
  const cartItemCount = cartData?.products?.length || 0

  const handleLogout = async () => {
    dispatch(logout())
    dispatch(baseAPI.util.resetApiState());
    history.push('/')
  }

  return (
    <div className="sticky top-0 z-10 w-full bg-white border-b border-gray-300">
      <div className="container mx-auto px-4 py-4 max-w-7xl flex justify-between items-center">
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
        {user ? (
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
          <span className={`z-10 inline-flex justify-center items-center text-white text-sm bg-red-800 h-6 w-6 border rounded-full absolute ml-4`}>
            {cartItemCount}
          </span>
        </Link>

          <MenuIcon className="h-5 w-5 cursor-pointer hidden lg:block" onClick={() => setShowSidenavModal(true)} />
        </div>
      </div>
    </div>
  )
}

export default Navbar;