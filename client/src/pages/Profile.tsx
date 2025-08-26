import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import SmallReview from '../components/SmallReview'
import CircleLoader from '../skeleton_loaders/CircleLoader'
import { useGetUserProfileQuery } from '../api/userApi'
import { useGetRatingsByUserQuery } from '../api/ratingsApi'

const DEFAULT_AVATAR = 'https://images-na.ssl-images-amazon.com/images/S/amazon-avatars-global/default._CR0,0,1024,1024_SX460_.png'

const Profile = () => {

  const { userID }: { userID: string } = useParams()
  
  const { data: profileUser, isLoading: userLoading } = useGetUserProfileQuery(userID)
  const { data: profileUserReviews = [], isLoading: reviewsLoading } = useGetRatingsByUserQuery(userID)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [userID])

  return (
    <div className="container mx-auto px-4 py-10 bg-gray-100 max-w-6xl flex-grow">
      <div>
        {userLoading ? (
          <div className="flex justify-center py-4">
            <CircleLoader size={16} />
          </div>
        ) : (
          <>
            <div className="flex items-center mb-5 border border-gray-300 p-8 rounded-lg bg-white gap-2">
              <div className="">
                <img src={profileUser?.profilePic ? `${process.env.REACT_APP_DEV_URL}${profileUser.profilePic}` : DEFAULT_AVATAR} alt="" className="h-36 w-36 rounded-full object-cover mb-3" />
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
                  <div className="font-bold text-2xl">{reviewsLoading ? '...' : profileUserReviews.length}</div>
                  <div>Reviews</div>
                </div>

                <div>
                  <div className="font-bold text-2xl">{profileUser?.favorites?.length || 0}</div>
                  <div>Favorites</div>
                </div>
              </div>
            </div>
          </>
        )}

        {reviewsLoading ? (
          <div className="border border-gray-300 p-8 rounded-lg bg-white mb-4">
            <div className="font-medium mb-4">Reviews</div>
            <div className="flex justify-center py-4">
              <CircleLoader size={12} />
            </div>
          </div>
        ) : profileUserReviews.length > 0 ? (
          <div className="">
            <div className="font-medium border border-gray-300 border-b-0 rounded-lg bg-white p-3">Reviews</div>
            <div className="">
              {profileUserReviews.map((review: any) => <SmallReview key={review._id} review={review} author={profileUser as any} />)}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default Profile
