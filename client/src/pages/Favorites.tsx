import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
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

  console.log(user)
  console.log(favoriteShoes)


  return (
    loading ? <div className="flex justify-center py-4 h-screen"><CircleLoader size={16} /></div> : (
      <div className="min-h-screen">
        <div className="flex flex-wrap justify-start">
          {favoriteShoes.map((shoe) => shoe && <SmallShoe shoe={shoe} />)}
        </div>
      </div>
    )
  )
}

export default Favorites
