import { HeartIcon as HeartOutline } from '@heroicons/react/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/solid';
import axios from 'axios';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useParams } from 'react-router-dom';
import FullShoeReviews from '../components/FullShoeReviews';
import ShoppingCartModal from '../components/ShoppingCartModal';
import { updateCart } from '../redux/cartRedux';
import { RootState } from "../redux/store";
import { updateUser } from '../redux/userRedux';
import CircleLoader from '../skeleton_loaders/CircleLoader';
import FullShoeSkeleton from '../skeleton_loaders/FullShoeSkeleton';
import { IProduct, IRating, Shoe, UserType } from "../types/types";

const SHOE_SIZES = ['4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13', '13.5', '14', '14.5', '15', '16', '17']

const AVERAGE_MAN_FOOT_SIZE = '10.5'

const FullShoePage = () => {

  const user: Partial<UserType> = useSelector((state: RootState) => state.user && state.user.currentUser)
  const { currentCart } = useSelector((state: RootState) => state.cart)

  const { shoeID }: { shoeID: string } = useParams()
  const dispatch = useDispatch()
  const initialSize = (Object.keys(user).length > 0 && user.preselectedShoeSize && String(user.preselectedShoeSize)) || AVERAGE_MAN_FOOT_SIZE

  const [shoe, setShoe] = useState<Partial<Shoe>>({})
  const [shoeRatings, setShoeRatings] = useState<Array<IRating>>([])
  const [selectedSize, setSelectedSize] = useState(initialSize)
  const [imageNum, setImageNum] = useState(0)
  const [shoeLoading, setShoeLoading] = useState(false)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    setShoeLoading(true)
    setReviewLoading(true)

    const fetchFromAPI = async () => {

      const response = await axios.get(`${process.env.REACT_APP_DEV_URL}/shoes/${shoeID}`)
      setShoe(response.data)
      setShoeLoading(false)

      const ratings = await fetchAllRatings(response.data.ratings)
      setShoeRatings(ratings)
      setReviewLoading(false)
    }
    fetchFromAPI()
  }, [shoeID])

  const handleAddToCart = async () => {
    if (currentCart && currentCart.products && shoe && shoe.shoeID) {

      const newProduct: Partial<IProduct> = {
        productID: shoe.shoeID,
        size: Number(selectedSize),
        quantity: 1,
        retailPrice: shoe.retailPrice
      }
      const currentProducts = currentCart?.products

      const body = { products: [...currentProducts, newProduct] }


      const response = await axios.put(`${process.env.REACT_APP_DEV_URL}/cart/${currentCart?._id}`, body)
      const newCart = response.data

      dispatch(updateCart(newCart))
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
    const response = await axios.put(`${process.env.REACT_APP_DEV_URL}/shoes/favorite`, body)

    dispatch(updateUser(response.data.updatedUser))
    setShoe(response.data.updatedShoe)
  }

  const fetchAllRatings = async (ratingIDs: Array<string>) => {
    const ratings = []

    if (ratingIDs) {
      for (let ratingID of ratingIDs) {
        const response = await axios.get(`${process.env.REACT_APP_DEV_URL}/rating/${ratingID}`)

        if (response.data !== null) {
          const authorResponse = await axios.get(`${process.env.REACT_APP_DEV_URL}/users/${response.data.userID}`)
          ratings.push({ ...response.data, postedByUser: authorResponse.data })
        }
      }
    }
    return ratings
  }



  return (

    <div>
      <div className="p-5 px-14 w-full h-full sm:px-4 xl:px-6">
        <div className="w-full h-full">
          {shoeLoading ? <FullShoeSkeleton />
            : (
              <div className="flex xl:block">
                <div className="flex-3">
                  {shoe && shoe.image && shoe.image["360"].length > 0 ? (
                    <div className="xl:px-4">
                      <img src={shoe?.image["360"][imageNum]} alt={shoe.name} />
                      <input type="range" id="volume" name="volume" value={imageNum} onChange={(e) => setImageNum(Number(e.target.value))} min="0" max={shoe.image["360"].length - 1} className="w-full"></input>
                    </div>
                  ) : (
                    <img src={shoe?.image?.original} alt={shoe.name} />
                  )}
                </div>

                <div className="flex-2 p-10 xl:p-4">
                  <div className="text-2xl">{shoe.name}</div>
                  <div className="text-xl text-red-800">${shoe.retailPrice}</div>
                  <div className="my-5">{`SELECT US ${shoe?.gender?.toUpperCase()}S`}</div>
                  <div className="flex flex-wrap box-border justify-between">
                    {SHOE_SIZES.map((shoeSize) => {
                      return (
                        <div className={`box-border cursor-pointer text-center border py-2 mb-2 hover:border-gray-600 w-32/100 ` + (shoeSize === selectedSize ? 'border-black' : 'border-gray-300')} onClick={() => setSelectedSize(shoeSize)}>
                          {shoeSize}
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex justify-between xl:block gap-2">
                    <button className="bg-black text-white rounded-full py-3 my-5 hover:bg-gray-700 w-1/2 xl:w-full xl:mb-0" onClick={handleAddToCart}>
                      Add to Bag
                    </button>

                    <button className="flex justify-center items-center bg-white border border-gray-300 text-black rounded-full py-3  my-5 hover:border-gray-600 w-1/2 xl:w-full xl:mb-0" onClick={handleFavorite}>
                      {user && shoe?._id && user?.favorites?.includes(shoe?._id) ? <span className="inline-flex items-center"> <HeartSolid className="mr-2 h-5 w-5" /></span> : <span className="inline-flex items-center"> <HeartOutline className="mr-2 h-5 w-5" /></span>}
                      {shoe?.favorites?.length}
                    </button>

                  </div>

                  <div className="my-5">
                    {shoe?.story}
                  </div>

                  <div>
                    <span className="font-bold">Brand:</span> {shoe?.brand}
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
                        <img src="/assets/flight_club.png" alt={'Flight Club'} className="w-32" />
                      </a>
                    ) : null}

                    {shoe.links?.goat ? (
                      <a href={shoe.links.goat} target="_blank" rel="noreferrer">
                        <img src="/assets/goat.png" alt={'Goat'} className="w-32" />
                      </a>
                    ) : null}

                    {shoe.links?.stadiumGoods ? (
                      <a href={shoe.links.stadiumGoods} target="_blank" rel="noreferrer">
                        <img src="/assets/stadium_goods.svg" alt={'Stadium Goods'} className="w-32" />
                      </a>
                    ) : null}

                    {shoe.links?.stockX ? (
                      <a href={shoe.links.stockX} target="_blank" rel="noreferrer">
                        <img src="/assets/stockx.jpeg" alt={'Stock X'} className="w-32" />
                      </a>
                    ) : null}


                  </div>
                </div>
              </div>
            )}

          {reviewLoading ? <div className="flex justify-center"><CircleLoader size={16} /></div> : (
            <FullShoeReviews shoe={shoe} shoeRatings={shoeRatings} setShoeRatings={setShoeRatings} />
          )}

        </div>
      </div>

      <ShoppingCartModal showModal={showModal} setShowModal={setShowModal} />
    </div>
  )
}

export default FullShoePage
