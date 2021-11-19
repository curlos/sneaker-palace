import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import SmallShoe from '../components/SmallShoe'
import { RootState } from '../redux/store'
import CircleLoader from '../skeleton_loaders/CircleLoader'
import { Shoe, UserType } from '../types/types'

const Favorites = () => {

  const user: Partial<UserType> = useSelector((state: RootState) => state.user && state.user.currentUser)

  const [favoriteShoes, setFavoriteShoes] = useState<Array<Shoe>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    const fetchFromAPI = async () => {
      const favorites = await getAllFavorites()
      setFavoriteShoes(favorites)
      setLoading(false)
    }
    fetchFromAPI()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getAllFavorites = async () => {
    const favorites: Array<Shoe> = []

    if (user.favorites) {
      for (let id of user.favorites) {
        const response = await axios.get(`${process.env.REACT_APP_DEV_URL}/shoes/objectID/${id}`)
        favorites.push(response.data)
      }
    }

    return favorites
  }





  return (
    loading ? <div className="flex justify-center py-4 h-screen"><CircleLoader size={16} /></div> : (
      <div className="min-h-screen">
        {favoriteShoes.length > 0 ? (
          <div className="flex flex-wrap justify-start">
            {favoriteShoes.map((shoe) => shoe && <SmallShoe shoe={shoe} />)}
          </div>
        ) : (
          <div className="flex justify-center mt-10">
            <div>No shoes in your favorites.</div>
            <button className="py-4 px-10 bg-black text-white"><Link to="/shoes">Add shoes</Link></button>
          </div>
        )}
      </div>
    )
  )
}

export default Favorites
