import React, {useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSelector, useDispatch } from "react-redux";
import { CartState, IProduct, UserType } from "../types/types";
import { RootState } from "../redux/store";
import axios from 'axios'
import moment from 'moment'
import { HeartIcon as HeartSolid } from '@heroicons/react/solid'
import { HeartIcon as HeartOutline } from '@heroicons/react/outline'
import { Shoe } from '../types/types'
import { updateUser } from '../redux/userRedux'
import { updateCart } from '../redux/cartRedux';
import { current } from '@reduxjs/toolkit';

const SHOE_SIZES = ['4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13', '13.5', '14', '14.5', '15', '16', '17' ]

const AVERAGE_MAN_FOOT_SIZE = '10.5'
const AVERAGE_WOMEN_FOOT_SIZE = '8.5'

const FullShoePage = () => {

  const user: Partial<UserType> = useSelector((state: RootState) => state.user.currentUser)
  const cart: Partial<CartState> = useSelector((state: RootState) => state.cart.currentCart)
  const currentCart = cart?.currentCart

  const { shoeID }: { shoeID: string } = useParams()
  const dispatch = useDispatch()
  
  const [shoe, setShoe] = useState<Partial<Shoe>>({})
  const [selectedSize, setSelectedSize] = useState(AVERAGE_MAN_FOOT_SIZE)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    const fetchFromAPI = async () => {
      console.log(shoeID)
      const response = await axios.get(`http://localhost:8888/shoes/${shoeID}`)
      setShoe(response.data)
      setLoading(false)
    }
    fetchFromAPI()
  }, [])

  const handleAddToCart = async () => {
    if (currentCart && currentCart.products && shoe && shoe.shoeID) {
      console.log('adding to cart')
      const newProduct: Partial<IProduct> = {
        productID: shoe.shoeID,
        size: Number(selectedSize),
        quantity: 1,
      }
      const currentProducts = currentCart?.products

      const body = { products: [...currentProducts, newProduct]}
      console.log(body)

      const response = await axios.put(`http://localhost:8888/cart/${currentCart?._id}`, body)
      const newCart = response.data
      console.log(newCart)
      dispatch(updateCart({currentCart: newCart}))
    }
  }

  const handleFavorite = async () => {
    if (!user) {
      return
    }

    const body = {
      shoeID: shoeID,
      userID: user['_id']
    }
    const response = await axios.put('http://localhost:8888/shoes/favorite', body)
    console.log(response.data)
    dispatch(updateUser(response.data.updatedUser))
    setShoe(response.data.updatedShoe)
  }

  console.log(shoe)

  return (

    <div className="p-5 px-28">
      {loading ? 'Loading...' :
      (<div>
        <div className="flex">
          <div className="flex-3">
            <img src={shoe?.image?.original} alt={shoe.name}/>
          </div>

          <div className="flex-2 p-10">
            <div className="text-2xl">{shoe.name}</div>
            <div className="text-xl text-emerald-500">${shoe.retailPrice}</div>
            <div className="my-5">{`SELECT US ${shoe?.gender?.toUpperCase()}S`}</div>
            <div className="flex flex-wrap">
              {SHOE_SIZES.map((shoeSize) => {
                return (
                  <div className={`cursor-pointer text-center border py-2 mb-2 mr-2 hover:border-gray-600 h-15 w-20 ` + (shoeSize === selectedSize ? 'border-black' : 'border-gray-300')} onClick={() => setSelectedSize(shoeSize)}>
                    {shoeSize}
                  </div>
                )
              })}
            </div>

            <div className="flex justify-center flex-wrap">
              <button className="bg-black text-white rounded-full flex-2 py-3 mr-5 my-5 hover:bg-gray-700" onClick={handleAddToCart}>
                Add to Bag
              </button>

              <button className="flex justify-center items-center bg-white border border-gray-300 text-black rounded-full flex-2 my-5 hover:border-gray-600" onClick={handleFavorite}>
                {user && shoe?._id && user?.favorites?.includes(shoe?._id) ? <span className="inline-flex items-center"> <HeartSolid className="mr-2 h-5 w-5" /></span> : <span className="inline-flex items-center"> <HeartOutline className="mr-2 h-5 w-5" /></span>}
                {shoe?.favorites?.length}
              </button>

            </div>

            <div className="my-5">
              {shoe?.story}
            </div>

            <div>
              <span className="font-bold">Colorway:</span> {shoe?.colorway}
            </div>

            <div>
              <span className="font-bold">Gender:</span> {shoe?.gender?.toUpperCase()}
            </div>

            <div>
              <span className="font-bold">Release date:</span> {moment(shoe.releaseDate).format('MMMM Do, YYYY')}
            </div>

            <div>
              <span className="font-bold">SKU:</span> {shoe.sku}
            </div>

            <div className="flex w-full my-5">
              {shoe.links?.flightClub ? (
                <a href={shoe.links.flightClub} target="_blank" rel="noreferrer">
                  <img src="/assets/flight_club.png" alt={'Flight Club'} className="w-32"/>
                </a>
              ) : null}

              {shoe.links?.goat ? (
                <a href={shoe.links.goat} target="_blank" rel="noreferrer">
                  <img src="/assets/goat.png" alt={'Goat'} className="w-32"/>
                </a>
              ) : null}

              {shoe.links?.stadiumGoods ? (
                <a href={shoe.links.stadiumGoods} target="_blank" rel="noreferrer">
                  <img src="/assets/stadium_goods.svg" alt={'Stadium Goods'} className="w-32"/>
                </a>
              ) : null}

              {shoe.links?.stockX ? (
                <a href={shoe.links.stockX} target="_blank" rel="noreferrer">
                  <img src="/assets/stockx.jpeg" alt={'Stock X'} className="w-32"/>
                </a>
              ) : null}

              
            </div>

            

          </div>
        </div>

      </div>)}
    </div>
  )
}

export default FullShoePage
