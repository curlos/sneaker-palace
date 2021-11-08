import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import SmallReview from '../components/SmallReview'
import { IRating, UserType } from '../types/types'

const Profile = () => {

  const { userID }: { userID: string } = useParams()
  const [profileUser, setProfileUser] = useState<Partial<UserType>>({})
  const [profileUserReviews, setProfileUserReviews] = useState<Array<IRating>>([])
  const [loading, setLoading] = useState(true)
  

  useEffect(() => {
    const fetchProfileUserFromAPI = async () => {
      const response = await axios.get(`http://localhost:8888/users/${userID}`)
      const newProfileUserReviews = await fetchAllReviews(response.data.ratings)
      setProfileUser(response.data)
      setProfileUserReviews(newProfileUserReviews)
      setLoading(false)
    }

    fetchProfileUserFromAPI()
  }, [])

  const fetchAllReviews = async (reviewIDs: Array<string>) => {
    const ratings = []
    console.log(reviewIDs)
    if (reviewIDs) {
      for (let reviewID of reviewIDs) {
        const response = await axios.get(`http://localhost:8888/rating/${reviewID}`)
        console.log(response.data)
        if (response.data !== null) {
          const authorResponse = await axios.get(`http://localhost:8888/users/${response.data.userID}`)
          ratings.push({...response.data, postedByUser: authorResponse.data})
        }
      }
    }
    return ratings
  }

  console.log(profileUser)
  console.log(profileUserReviews)

  return (
    loading ? <div>Loading...</div> : (
      <div className="px-48 py-10 bg-gray-100">
        <div>
          <div className="flex items-center mb-5 border border-gray-300 p-8 rounded-lg bg-white">
            <div className="">
              <img src="https://images-na.ssl-images-amazon.com/images/S/amazon-avatars-global/default._CR0,0,1024,1024_SX460_.png" alt={profileUser?.firstName} className="h-36 w-36"/>
            </div>
            <div className="text-2xl font-medium ml-2">{profileUser?.firstName} {profileUser?.lastName}</div>
          </div>

          <div className="border border-gray-300 p-8 rounded-lg bg-white mb-4">
            <div className="font-medium">Insights</div>
            <div className="flex gap-6">
              <div>
                <div className="font-bold text-2xl">0</div>
                <div>Helpful votes</div>
              </div>

              <div>
                <div className="font-bold text-2xl">0</div>
                <div>Unhelpful votes</div>
              </div>

              <div>
                <div className="font-bold text-2xl">0</div>
                <div>Reviews</div>
              </div>

              <div>
                <div className="font-bold text-2xl">0</div>
                <div>Favorites</div>
              </div>
            </div>
          </div>

          <div className="">
            <div className="font-medium border border-gray-300 border-b-0 rounded-lg bg-white p-3">Reviews</div>
            <div className="">
              {profileUserReviews.map((review) => <SmallReview review={review} author={profileUser}/>)}
            </div>
          </div>
        </div>
      </div>
    )
  )
}

export default Profile
