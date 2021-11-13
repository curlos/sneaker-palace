import React from 'react'
import { XIcon } from '@heroicons/react/solid'

interface Props {
  setShowMessage: React.Dispatch<React.SetStateAction<boolean>>,
  message: string
}

const FailureMessage = ({ setShowMessage, message }: Props) => {


  return (
    <div className="p-3 bg-red-200 text-red-500 w-full border border-red-600 rounded-lg my-3">
      <div className="flex justify-between items-center text-lg">
        <div>{message}</div>
        <XIcon className="h-5 w-5 text-gray-600 hover:text-gray-800 cursor-pointer" onClick={() => setShowMessage(false)}/>
      </div>
    </div>
  )
}

export default FailureMessage
