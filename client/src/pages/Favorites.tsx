import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import SmallShoe from '../components/SmallShoe'
import { RootState } from '../redux/store'
import CircleLoader from '../skeleton_loaders/CircleLoader'
import { Shoe } from '../types/types'
import { useGetLoggedInUserQuery } from '../api/userApi'
import { useGetShoesByObjectIdsQuery } from '../api/shoesApi'

const Favorites = () => {
  const userId = useSelector((s: RootState) => s.user.currentUser?._id);
  const { data: user } = useGetLoggedInUserQuery(userId);
  
  const { data: favoriteShoes, isLoading: loading } = useGetShoesByObjectIdsQuery(
    user?.favorites || [],
    { skip: !user?.favorites || user.favorites.length === 0 }
  );

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    loading ? <div className="flex justify-center py-4 h-screen"><CircleLoader size={16} /></div> : (
      <div className="container mx-auto px-4 max-w-7xl flex-grow">
        <div className="text-3xl py-5">Your Favorites</div>
        {favoriteShoes && favoriteShoes.length > 0 ? (
          <div className="flex flex-wrap justify-start">
            {favoriteShoes?.map((shoe: Shoe) => shoe && <SmallShoe key={shoe._id} shoe={shoe} />)}
          </div>
        ) : (
          <div className="p-4 flex justify-center items-center gap-4 mt-10">
            <div>No shoes in your favorites.</div>
            <button className="py-4 px-10 sm:px-2 bg-black text-white"><Link to="/shoes">Add shoes</Link></button>
          </div>
        )}
      </div>
    )
  )
}

export default Favorites
