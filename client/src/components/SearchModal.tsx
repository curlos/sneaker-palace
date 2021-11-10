import { SearchIcon } from '@heroicons/react/outline'
import React, { useState } from 'react'
import SmallProductList from './SmallProductList'

interface Props {
  showModal: boolean,
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>
}

const handleBubblingDownClick = (e: React.FormEvent) => {
  e.stopPropagation()
}

const handleSubmit = async () => {

}

const SearchModal = ({ showModal, setShowModal}: Props) => {

  const [searchText, setSearchText] = useState('')

  return (
    <div className="fixed z-20 w-screen h-screen bg-black bg-opacity-40" onClick={() => setShowModal(!showModal)}>
      <aside className={`transform z-30 top-0 right-0 w-96 bg-white text-black fixed h-full overflow-auto ease-in-out transition-all duration-1000 ${showModal ? 'translate-x-0' : 'translate-x-full'}`} onClick={handleBubblingDownClick}>
        <form onSubmit={handleSubmit} className=" flex border-0 border-b border-solid border-gray-300 p-4 py-6">
            <SearchIcon className="h-7 w-7 text-gray-400" onClick={handleSubmit}/>
            <input className="ml-5 placeholder-gray-400 placeholder-opacity-100 outline-none uppercase text-lg font-medium" placeholder="TYPE TO SEARCH" value={searchText} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.currentTarget.value)} />
        </form>

        <SmallProductList searchText={searchText}/>
      </aside>
    </div>
  )
}

export default SearchModal
