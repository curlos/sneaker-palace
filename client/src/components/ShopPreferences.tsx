import React, { ChangeEvent, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import { updateUser } from '../redux/userRedux'
import { UserType } from '../types/types'
import FailureMessage from './FailureMessage'
import SuccessMessage from './SuccessMessage'
import * as short from "short-uuid"
import { useUpdateUserPreferencesMutation } from '../api/userApi'

const SHOE_SIZES = ['4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13', '13.5', '14', '14.5', '15', '16', '17']

const ShopPreferences = () => {

  const dispatch = useDispatch()

  const user: Partial<UserType> = useSelector((state: RootState) => state.user && state.user.currentUser)
  const [preselectedShoeSize, setPreselectedShoeSize] = useState(user.preselectedShoeSize || 8)
  const [preferredGender, setPreferredGender] = useState(user.preferredGender || 'men')
  const [unitOfMeasure, setUnitOfMeasure] = useState(user.unitOfMeasure || 'imperial')
  
  const [updateUserPreferences, { isLoading }] = useUpdateUserPreferencesMutation()
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showFailureMessage, setShowFailureMessage] = useState(false)

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()

    const preferences = {
      preselectedShoeSize,
      preferredGender,
      unitOfMeasure,
    }

    try {
      const result = await updateUserPreferences({ 
        userId: user._id!, 
        preferences 
      }).unwrap()
      
      // Update Redux state with the response
      dispatch(updateUser(result))
      
      // Show success message and auto-dismiss after 3 seconds
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)
    } catch (error) {
      console.error('Failed to update user preferences:', error)
      
      // Show error message and auto-dismiss after 3 seconds
      setShowFailureMessage(true)
      setTimeout(() => setShowFailureMessage(false), 3000)
    }
  }

  return (
    <div className="w-1/2 sm:w-full sm:mt-8">
      <div className="text-2xl font-medium mb-4">Shop Preferences</div>

      <form>
        <div className="mb-4">
          <div className="mb-1 font-medium w-full">Shoe Size</div>
          <select name="shoeSizes" className="border-gray-500 rounded-lg text-black w-full" value={preselectedShoeSize} onChange={(e: ChangeEvent<HTMLSelectElement>) => setPreselectedShoeSize(Number(e.currentTarget.value))}>
            {SHOE_SIZES.map((shoeSize) => <option key={`${Number(shoeSize)}-${short.generate()}`} value={shoeSize}>{shoeSize}</option>)}
          </select>
          <div className="text-gray-500 text-sm">Provide your shoe size to have it preselected when you shop.</div>
        </div>

        <div className="mb-4">
          <div className="font-medium mb-3">Preferred Shop Settings</div>

          <div className="flex items-center mb-2">
            <input name="gender" type="radio" value="Yes" className="mr-2 h-5 w-5" checked={preferredGender === 'women'} onChange={() => setPreferredGender('women')} />
            <label>Women's</label>
          </div>

          <div className="flex items-center mb-2">
            <input name="gender" type="radio" value="Yes" className="mr-2 h-5 w-5" checked={preferredGender === 'men'} onChange={() => setPreferredGender('men')} />
            <label>Men's</label>
          </div>
        </div>

        <div className="mb-4">
          <div className="font-medium mb-3">Unit of Measure</div>

          <div className="flex items-center mb-2">
            <input name="unitOfMeasure" type="radio" value="Yes" className="mr-2 h-5 w-5" checked={unitOfMeasure === 'metric'} onChange={() => setUnitOfMeasure('metric')} />
            <label>Metric</label>
          </div>

          <div className="flex items-center mb-2">
            <input name="unitOfMeasure" type="radio" value="Yes" className="mr-2 h-5 w-5" checked={unitOfMeasure === 'imperial'} onChange={() => setUnitOfMeasure('imperial')} />
            <label>Imperial</label>
          </div>
        </div>

        {showSuccessMessage && <SuccessMessage setShowMessage={setShowSuccessMessage} message={'Settings updated!'} />}
        {showFailureMessage && <FailureMessage setShowMessage={setShowFailureMessage} message={'Settings not updated, error occurred!'} />}

        <div className="flex justify-end">
          <button 
            onClick={handleEdit} 
            disabled={isLoading}
            className="bg-black text-white rounded-full py-3 my-5 hover:bg-gray-700 px-5 py-3 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ShopPreferences
