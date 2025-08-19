import { SearchIcon } from '@heroicons/react/outline'
import React, { useEffect, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import SmallProductList from './SmallProductList'

interface Props {
  showSearchModal: boolean,
  setShowSearchModal: React.Dispatch<React.SetStateAction<boolean>>
}

const SearchModal = ({ showSearchModal, setShowSearchModal }: Props) => {

  const history = useHistory()
  const [searchText, setSearchText] = useState('')
  const [finalSearchText, setFinalSearchText] = useState('')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleBubblingDownClick = (e: React.FormEvent) => {
    e.stopPropagation()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    history.push(`/shoes?query=${searchText}`)
    setShowSearchModal(false)
    window.location.reload()
  }

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      setFinalSearchText(searchText)
    }, 500)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [searchText])

  return (
    <div className="fixed z-20 w-screen h-screen bg-black bg-opacity-40" onClick={() => setShowSearchModal(!showSearchModal)}>
      <aside className={`transform z-30 top-0 right-0 w-96 bg-white text-black fixed h-full overflow-y-scroll sm:no-scrollbar ease-in-out transition-all duration-1000 ${showSearchModal ? 'translate-x-0' : 'translate-x-full'} sm:w-10/12`} onClick={handleBubblingDownClick}>
        <form onSubmit={handleSubmit} className=" flex border-0 border-b border-solid border-gray-300 p-4 py-6">
          <SearchIcon className="h-7 w-7 text-gray-400" onClick={handleSubmit} />
          <input className="ml-5 placeholder-gray-400 placeholder-opacity-100 outline-none uppercase text-lg font-medium" placeholder="TYPE TO SEARCH" value={searchText} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.currentTarget.value)} />
        </form>

        <SmallProductList searchText={searchText} finalSearchText={finalSearchText} setShowModal={setShowSearchModal} handleSubmit={handleSubmit} />
      </aside>
    </div>
  )
}

export default SearchModal
