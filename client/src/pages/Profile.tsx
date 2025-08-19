import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import SmallReview from '../components/SmallReview'
import CircleLoader from '../skeleton_loaders/CircleLoader'
import { IRating, UserType } from '../types/types'

const DEFAULT_AVATAR = 'https://images-na.ssl-images-amazon.com/images/S/amazon-avatars-global/default._CR0,0,1024,1024_SX460_.png'

const Profile = () => {

  const { userID }: { userID: string } = useParams()
  const [profileUser, setProfileUser] = useState<Partial<UserType>>({})
  const [profileUserReviews, setProfileUserReviews] = useState<Array<IRating>>([])
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    window.scrollTo(0, 0)
    const fetchProfileUserFromAPI = async () => {
      const response = await axios.get(`${process.env.REACT_APP_DEV_URL}/users/${userID}`)
      const newProfileUserReviews = await fetchAllReviews(response.data.ratings)
      setProfileUser(response.data)
      setProfileUserReviews(newProfileUserReviews)
      setLoading(false)
    }

    fetchProfileUserFromAPI()
  }, [userID])

  const fetchAllReviews = async (reviewIDs: Array<string>) => {
    const ratings = []

    if (reviewIDs) {
      for (let reviewID of reviewIDs) {
        const response = await axios.get(`${process.env.REACT_APP_DEV_URL}/rating/${reviewID}`)

        if (response.data !== null) {
          const authorResponse = await axios.get(`${process.env.REACT_APP_DEV_URL}/users/${response.data.userID}`)
          ratings.push({ ...response.data, postedByUser: authorResponse.data })
        }
      }
    }
    return ratings
  }

  return (
    loading ? <div className="flex justify-center py-4 h-screen w-screen max-w-100"><CircleLoader size={16} /></div> : (
      <div className="px-48 py-10 bg-gray-100 sm:px-4">
        <div>
          <div className="flex items-center mb-5 border border-gray-300 p-8 rounded-lg bg-white">
            <div className="">

              <img src={profileUser.profilePic ? `${process.env.REACT_APP_DEV_URL}${profileUser.profilePic}` : DEFAULT_AVATAR} alt="" className="h-36 w-36 rounded-full object-cover mb-3" />
            </div>
            <div className="text-2xl font-medium ml-2">{profileUser?.firstName} {profileUser?.lastName}</div>
          </div>

          <div className="border border-gray-300 p-8 rounded-lg bg-white mb-4">
            <div className="font-medium">Insights</div>
            <div className="flex gap-6 sm:block">
              <div>
                <div className="font-bold text-2xl">{profileUser?.helpful?.length || 0}</div>
                <div>Helpful votes</div>
              </div>

              <div>
                <div className="font-bold text-2xl">{profileUser?.notHelpful?.length || 0}</div>
                <div>Unhelpful votes</div>
              </div>

              <div>
                <div className="font-bold text-2xl">{profileUserReviews.length}</div>
                <div>Reviews</div>
              </div>

              <div>
                <div className="font-bold text-2xl">{profileUser?.favorites?.length || 0}</div>
                <div>Favorites</div>
              </div>
            </div>
          </div>

          {profileUserReviews.length > 0 && (
            <div className="">
              <div className="font-medium border border-gray-300 border-b-0 rounded-lg bg-white p-3">Reviews</div>
              <div className="">
                {profileUserReviews.map((review) => <SmallReview key={review._id} review={review} author={profileUser} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  )
}

export default Profile
