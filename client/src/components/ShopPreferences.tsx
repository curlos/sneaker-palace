import axios from 'axios'
import React, { ChangeEvent, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import { updateUser } from '../redux/userRedux'
import { UserType } from '../types/types'
import FailureMessage from './FailureMessage'
import SuccessMessage from './SuccessMessage'

const SHOE_SIZES = ['4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13', '13.5', '14', '14.5', '15', '16', '17']

const ShopPreferences = () => {

  const dispatch = useDispatch()

  const user: Partial<UserType> = useSelector((state: RootState) => state.user && state.user.currentUser)
  const [preselectedShoeSize, setPreselectedShoeSize] = useState(user.preselectedShoeSize || 8)
  const [preferredGender, setPreferredGender] = useState(user.preferredGender || 'men')
  const [unitOfMeasure, setUnitOfMeasure] = useState(user.unitOfMeasure || 'imperial')
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showFailureMessage, setShowFailureMessage] = useState(false)

  const handleEdit = async (e: React.FormEvent) => {

    e.preventDefault()

    const body = {
      preselectedShoeSize,
      preferredGender,
      unitOfMeasure,
    }



    const response = await axios.put(`${process.env.REACT_APP_DEV_URL}/users/${user._id}`, body)


    if (!response.data.error) {
      dispatch(updateUser(response.data))
      setShowSuccessMessage(true)
      setTimeout(() => { setShowSuccessMessage(false) }, 3000)
    } else {
      setShowFailureMessage(true)
      setTimeout(() => { setShowFailureMessage(false) }, 3000)
    }
  }

  return (
    <div className="w-1/2 sm:w-full sm:mt-8">
      <div className="text-2xl font-medium mb-4">Shop Preferences</div>

      <form>
        <div className="mb-4">
          <div className="mb-1 font-medium w-full">Shoe Size</div>
          <select name="shoeSizes" className="border-gray-500 rounded-lg text-gray-500 w-full" onChange={(e: ChangeEvent<HTMLSelectElement>) => setPreselectedShoeSize(Number(e.currentTarget.value))}>
            {SHOE_SIZES.map((shoeSize) => <option selected={Number(shoeSize) === Number(preselectedShoeSize)} value={shoeSize}>{shoeSize}</option>)}
          </select>
          <div className="text-gray-500 text-sm">Provide your shoe size to have it preselected when you shop.</div>
        </div>

        <div className="mb-4">
          <div className="font-medium mb-3">Preferred Shop Settings</div>

          <div className="flex items-center mb-2">
            <input name="gender" type="radio" value="Yes" className="mr-2 h-5 w-5" checked={preferredGender === 'women'} onClick={() => setPreferredGender('women')} />
            <label>Women's</label>
          </div>

          <div className="flex items-center mb-2">
            <input name="gender" type="radio" value="Yes" className="mr-2 h-5 w-5" checked={preferredGender === 'men'} onClick={() => setPreferredGender('men')} />
            <label>Men's</label>
          </div>
        </div>

        <div className="mb-4">
          <div className="font-medium mb-3">Unit of Measure</div>

          <div className="flex items-center mb-2">
            <input name="unitOfMeasure" type="radio" value="Yes" className="mr-2 h-5 w-5" checked={unitOfMeasure === 'metric'} onClick={() => setUnitOfMeasure('metric')} />
            <label>Metric</label>
          </div>

          <div className="flex items-center mb-2">
            <input name="unitOfMeasure" type="radio" value="Yes" className="mr-2 h-5 w-5" checked={unitOfMeasure === 'imperial'} onClick={() => setUnitOfMeasure('imperial')} />
            <label>Imperial</label>
          </div>
        </div>

        {showSuccessMessage ? <SuccessMessage setShowMessage={setShowSuccessMessage} message={'Settings updated!'} /> : null}
        {showFailureMessage ? <FailureMessage setShowMessage={setShowFailureMessage} message={'Settings not updated, error occured!'} /> : null}

        <div className="flex justify-end">
          <button onClick={handleEdit} className="rounded-full bg-gray-300 text-gray-500 px-5 py-3 hover:text-gray-700">Save</button>
        </div>


      </form>
    </div>
  )
}

export default ShopPreferences
