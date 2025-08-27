import { XIcon } from '@heroicons/react/outline'
import React from 'react'
import { useHistory } from 'react-router-dom'

interface Props {
  showModal: boolean,
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>
}

const SecurityMigrationModal = ({ showModal, setShowModal }: Props) => {
  const history = useHistory()

  const handleBubblingDownClick = (e: React.FormEvent) => {
    e.stopPropagation()
  }

  const handleGoToSettings = () => {
    setShowModal(false)
    history.push('/settings')
  }

  return (
    <div className="fixed z-20 w-screen h-screen bg-black bg-opacity-40 p-0 sm:p-8 md:p-16 lg:p-24 top-0 left-0 flex justify-center items-center" onClick={() => setShowModal(!showModal)}>
      <div className="w-full sm:w-full md:w-4/5 lg:w-3/5 xl:w-1/2 2xl:w-2/5 max-w-none lg:max-w-lg max-h-screen md:h-auto bg-white rounded-lg md:rounded-2xl lg:rounded-3xl p-3 md:p-6 lg:p-8 xl:p-12 overflow-y-auto" onClick={handleBubblingDownClick}>
        <div className="flex justify-between text-lg mb-4">
          <div className="font-bold">Security Enhancement Required</div>
          <XIcon className="h-5 w-5 text-gray-600 hover:text-gray-800 cursor-pointer" onClick={() => setShowModal(false)} />
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            We've enhanced our security systems to better protect your account. To continue using all features, please update your password.
          </p>
          <p className="text-gray-700">
            This is a one-time requirement that will help keep your account more secure.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button 
            onClick={() => setShowModal(false)}
            className="border border-gray-300 text-gray-700 rounded-full px-6 py-3 hover:bg-gray-50"
          >
            Later
          </button>
          <button 
            onClick={handleGoToSettings}
            className="bg-black text-white rounded-full px-6 py-3 hover:bg-gray-700"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  )
}

export default SecurityMigrationModal