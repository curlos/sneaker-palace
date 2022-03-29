import { CheckIcon, XIcon } from '@heroicons/react/outline'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { RootState } from '../redux/store'
import CircleLoader from '../skeleton_loaders/CircleLoader'
import { IProduct, Shoe } from '../types/types'

interface Props {
  showModal: boolean,
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>
}

const ShoppingCartModal = ({ showModal, setShowModal }: Props) => {

  const { currentCart } = useSelector((state: RootState) => state.cart)
  const [productInfo, setProductInfo] = useState<IProduct>()
  const [shoe, setShoe] = useState<Partial<Shoe>>()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchFromAPI = async () => {
      setLoading(true)
      if (currentCart && currentCart.products && currentCart?.products?.length >= 1) {
        const lastProduct = currentCart.products[currentCart.products.length - 1]

        const response = await axios.get(`${process.env.REACT_APP_DEV_URL}/shoes/${lastProduct.productID}`)
        setShoe(response.data)
        setProductInfo(lastProduct)
        setLoading(false)
      }
      setLoading(false)
    }
    fetchFromAPI()
  }, [currentCart])

  const handleBubblingDownClick = (e: React.FormEvent) => {
    e.stopPropagation()
  }

  return (
    <div className="fixed z-20 max-w-100 w-screen h-screen bg-black bg-opacity-40" onClick={() => setShowModal(!showModal)}>
      <aside className={`transform z-30 top-0 right-0 w-96 bg-white text-black fixed h-full overflow-y-scroll sm:no-scrollbar ease-in-out transition-all duration-1000 ${showModal ? 'translate-x-0' : 'translate-x-full'} sm:w-10/12`} onClick={handleBubblingDownClick}>
        <div className="p-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 bg-green-500 rounded-full text-white" />
              <div>Added to cart</div>
            </div>

            <div>
              <XIcon className="h-5 w-5 cursor-pointer" onClick={() => setShowModal(false)} />
            </div>
          </div>

          {loading ? <div className="p-5 flex justify-center"><CircleLoader size={16} /></div> : (
            shoe && productInfo && (
              <div className="">
                <div>
                  <img src={shoe.image?.original} alt={shoe.name} className="" />
                </div>

                <div className="">
                  <div>{shoe.name}</div>
                  <div className="text-gray-400 capitalize">{shoe.gender}'s Shoe</div>
                  <div className="text-gray-400">Size {productInfo.size}</div>
                  <div>${shoe.retailPrice}</div>
                </div>
              </div>
            )
          )}

          <div className="my-3">
            <Link to={`/cart`} onClick={() => setShowModal(false)}>
              <button className="rounded-full border border-gray-400 w-full p-3">
                View Bag ({currentCart?.products?.length})
              </button>
            </Link>
          </div>

          <div>
            <Link to={`/payment`} onClick={() => setShowModal(false)}>
              <button className="bg-black text-white rounded-full w-full p-3">
                Checkout
              </button>
            </Link>

          </div>
        </div>
      </aside>
    </div>
  )
}

export default ShoppingCartModal