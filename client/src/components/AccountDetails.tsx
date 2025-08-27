import { ChangeEvent, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import { postImage } from '../utils/postImage'
import FailureMessage from './FailureMessage'
import NewPasswordModal from './NewPasswordModal'
import SuccessMessage from './SuccessMessage'
import { useGetLoggedInUserQuery, useUpdateUserInfoMutation } from '../api/userApi';

const DEFAULT_AVATAR = 'https://images-na.ssl-images-amazon.com/images/S/amazon-avatars-global/default._CR0,0,1024,1024_SX460_.png'

const AccountDetails = () => {
  const userId = useSelector((s: RootState) => s.user.currentUser?._id);
  const requiresPasswordUpdate = useSelector((s: RootState) => s.user.currentUser?.requiresPasswordUpdate);
  const { data: user } = useGetLoggedInUserQuery(userId);
  const [firstName, setFirstName] = useState(user?.firstName)
  const [lastName, setLastName] = useState(user?.lastName)
  const [email, setEmail] = useState(user?.email)
  const [file, setFile] = useState<File>()

  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showFailureMessage, setShowFailureMessage] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const [updateUserInfo, { isLoading }] = useUpdateUserInfoMutation()

  // Keep track of timeouts
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEdit = async () => {
    let profilePicObj = user?.profilePic

    if (file) {
      const results = await postImage(file)

      profilePicObj = results.imagePath
    }

    const body = {
      firstName,
      lastName,
      email,
      profilePic: profilePicObj
    }

    try {
      await updateUserInfo({
        body 
      }).unwrap()
      
      // Show success message and auto-dismiss after 3 seconds
      setShowSuccessMessage(true)
      timeoutRef.current = setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Failed to update user preferences:', error)
      
      // Show error message and auto-dismiss after 3 seconds
      setShowFailureMessage(true)
      timeoutRef.current = setTimeout(() => setShowFailureMessage(false), 3000);
    }
  }

  const handleSelectFile = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0]
    setFile(file)
  }

  return (
    <div className="w-1/2 sm:w-full sm:mt-8">
      <div className="text-2xl font-medium mb-4">Account Details</div>

      <form>
        <div className="mb-4">
          {(file || user?.profilePic) ? (
            <img src={file ? URL.createObjectURL(file) : `${process.env.REACT_APP_DEV_URL}${user?.profilePic}`} alt="" className="h-150 w-150 rounded-full object-cover mb-3" />
          ) :
            <img src={DEFAULT_AVATAR} alt="" className="h-150 w-150 rounded-full object-cover mb-3" />
          }

          <input onChange={handleSelectFile} type="file" accept="image/*"></input>
        </div>

        <div className="mb-4">
          <div className="mb-1">First Name</div>
          <input type="text" placeholder="Email" className="rounded-lg w-full" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>

        <div className="mb-4">
          <div className="mb-1">Last Name</div>
          <input type="text" placeholder="Last Name" className="rounded-lg w-full" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>

        <div className="mb-4">
          <div className="mb-1">Email</div>
          <input type="text" placeholder="Email" className="rounded-lg w-full" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="mb-4">
          <div className="mb-1">Password</div>
          <input type="password" placeholder="Password" className="rounded-lg w-full cursor-pointer" value={'*********'} onClick={() => setShowModal(true)} readOnly />
          {requiresPasswordUpdate && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Password Update Required</h3>
                  <div className="mt-1 text-sm text-yellow-700">
                    For enhanced security, please update your password. Click the password field above to get started.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>

      {showSuccessMessage ? <SuccessMessage setShowMessage={setShowSuccessMessage} message={'Settings updated!'} /> : null}
      {showFailureMessage ? <FailureMessage setShowMessage={setShowFailureMessage} message={'Settings not updated, error occured!'} /> : null}

      <div className="flex justify-end">
        <button 
            onClick={handleEdit} 
            disabled={isLoading}
            className="bg-black text-white rounded-full py-3 my-5 hover:bg-gray-700 px-5 py-3 disabled:opacity-50"
          >
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      </div>

      {showModal ? <NewPasswordModal showModal={showModal} setShowModal={setShowModal} /> : null}
    </div>
  )
}

export default AccountDetails
