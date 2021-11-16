import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import SmallShoe from '../components/SmallShoe'
import { RootState } from '../redux/store'
import { Shoe, UserType } from '../types/types'

const Favorites = () => {

  const dispatch = useDispatch()
  const history = useHistory()
  const user: Partial<UserType> = useSelector((state: RootState) => state.user && state.user.currentUser)

  const [favoriteShoes, setFavoriteShoes] = useState<Array<Shoe>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFromAPI = async () => {
      const favorites = await getAllFavorites()
      setFavoriteShoes(favorites)
      setLoading(false)
    }
    fetchFromAPI()
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
    loading ? <div>Loading...</div> : (
      <div className="flex flex-wrap justify-center min-h-screen">
        {favoriteShoes.map((shoe) => shoe && <SmallShoe shoe={shoe} />)}
      </div>
    )
  )
}

export default Favorites
