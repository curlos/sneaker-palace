import { SearchIcon } from '@heroicons/react/outline'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useHistory } from 'react-router-dom'
import { RootState } from '../redux/store'
import { UserType } from '../types/types'
import SmallProductList from './SmallProductList'

interface Props {
  showSidenavModal: boolean,
  setShowSidenavModal: React.Dispatch<React.SetStateAction<boolean>>
}

const SidenavModal = ({ showSidenavModal, setShowSidenavModal }: Props) => {

  const history = useHistory()
  const user: Partial<UserType> = useSelector((state: RootState) => state.user && state.user.currentUser)

  let timer = 1000
  let timeoutVal = 1000

  const handleBubblingDownClick = (e: React.FormEvent) => {
    e.stopPropagation()
  }

  return (
    <div className="fixed z-20 w-screen h-screen bg-black bg-opacity-40" onClick={() => setShowSidenavModal(!showSidenavModal)}>
      <aside className={`transform z-30 top-0 right-0 w-96 bg-white text-black fixed h-full overflow-y-scroll sm:no-scrollbar ease-in-out transition-all duration-1000 ${showSidenavModal ? 'translate-x-0' : 'translate-x-full'} sm:w-10/12`} onClick={handleBubblingDownClick}>
        <div className="p-10 text-2xl font-medium flex flex-col justify-between h-screen">
          <div className="flex flex-col gap-5">
            <div>
              <Link to="/shoes">Sneakers</Link>
            </div>

            <div>
              <Link to={{ pathname: "/shoes", state: { gender: 'men' } }} onClick={() => setShowSidenavModal(false)}>Men</Link>
            </div>

            <div>
              <Link to={{ pathname: "/shoes", state: { gender: 'women' } }} onClick={() => setShowSidenavModal(false)}>Women</Link>
            </div>

            <div>
              <Link to={{ pathname: "/shoes", state: { gender: 'youth' } }} onClick={() => setShowSidenavModal(false)}>Youth</Link>
            </div>

            <div>
              <Link to={{ pathname: "/shoes", state: { gender: 'infant' } }} onClick={() => setShowSidenavModal(false)}>Infant</Link>
            </div>

            <div>
              <Link to={{ pathname: "/shoes", state: { brand: 'jordan' } }} onClick={() => setShowSidenavModal(false)}>Jordan</Link>
            </div>

            <div>
              <Link to={{ pathname: "/shoes", state: { brand: 'Nike' } }} onClick={() => setShowSidenavModal(false)}>Nike</Link>
            </div>

            <div>
              <Link to={{ pathname: "/shoes", state: { brand: 'Adidas' } }} onClick={() => setShowSidenavModal(false)}>Adidas</Link>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <Link to={`/profile/${user && user._id}`} onClick={() => setShowSidenavModal(false)}>Profile</Link>
            </div>

            <div>
              <Link to="/orders" onClick={() => setShowSidenavModal(false)}>Orders</Link>
            </div>

            <div>
              <Link to="/favorites" onClick={() => setShowSidenavModal(false)}>Favorites</Link>
            </div>

            <div>
              <Link to="/settings" onClick={() => setShowSidenavModal(false)}>Settings</Link>
            </div>

            <div>
              <Link to="/" onClick={() => setShowSidenavModal(false)}>Sign Out</Link>
            </div>
          </div>
        </div>

      </aside>
    </div>
  )
}

export default SidenavModal