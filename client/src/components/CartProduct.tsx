import axios from 'axios';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { updateCart } from '../redux/cartRedux';
import { RootState } from '../redux/store';
import CartProductSkeleton from '../skeleton_loaders/CartProductSkeleton';
import { IProduct, Shoe, UserType } from "../types/types";
import * as short from "short-uuid"


const SHOE_SIZES = ['4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13', '13.5', '14', '14.5', '15', '16', '17']
const QUANTITIES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

interface Props {
  productInfo: IProduct
}

const CartProduct = ({ productInfo }: Props) => {

  const dispatch = useDispatch()
  const user: Partial<UserType> = useSelector((state: RootState) => state.user && state.user.currentUser)
  const { currentCart } = useSelector((state: RootState) => state.cart)

  const [shoe, setShoe] = useState<Partial<Shoe>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFromAPI = async () => {
      const response = await axios.get(`${process.env.REACT_APP_DEV_URL}/shoes/${productInfo.productID}`)

      setShoe(response.data)
      setLoading(false)
    }

    fetchFromAPI()
  }, [productInfo])

  const handleChangeSize = async (e: ChangeEvent<HTMLSelectElement>) => {

    if (currentCart && currentCart.products) {
      const currentCartClone = { ...currentCart }
      const products = currentCartClone?.products
      const newProducts: Array<IProduct> = []

      if (products) {
        for (let product of products) {
          let finalSize = product.size
          if (product._id === productInfo._id) {
            finalSize = Number(e.currentTarget.value)
          }

          newProducts.push({
            productID: product.productID,
            size: finalSize,
            quantity: product.quantity,
            retailPrice: product.retailPrice,
            _id: product._id
          })
        }
      }

      if (Object.keys(user).length === 0) {

        const newCart = { ...currentCart, products: newProducts }
        dispatch(updateCart(newCart))
        localStorage.setItem('currentCart', JSON.stringify(newCart))

      } else {
        const body = { products: newProducts }
        const response = await axios.put(`${process.env.REACT_APP_DEV_URL}/cart/${currentCart?._id}`, body)
        const newCart = response.data

        dispatch(updateCart(newCart))
      }
    }
  }

  const handleChangeQuantity = async (e: ChangeEvent<HTMLSelectElement>) => {

    if (currentCart && currentCart.products) {
      const currentCartClone = { ...currentCart }
      const products = currentCartClone?.products
      const newProducts: Array<IProduct> = []

      if (products) {
        for (let product of products) {
          let finalQuantity = product.quantity
          if (product._id === productInfo._id) {
            finalQuantity = Number(e.currentTarget.value)
          }

          newProducts.push({
            productID: product.productID,
            size: product.size,
            quantity: finalQuantity,
            retailPrice: product.retailPrice,
            _id: product._id
          })
        }
      }

      if (Object.keys(user).length === 0) {
        const newCart = { ...currentCart, products: newProducts }
        dispatch(updateCart(newCart))
        localStorage.setItem('currentCart', JSON.stringify(newCart))
      } else {
        const body = { products: newProducts }
        const response = await axios.put(`${process.env.REACT_APP_DEV_URL}/cart/${currentCart?._id}`, body)
        const newCart = response.data

        dispatch(updateCart(newCart))
      }
    }
  }

  const handleRemoveProduct = async () => {
    const newProducts = currentCart?.products?.filter((product) => product._id !== productInfo._id)

    if (Object.keys(user).length === 0) {
      const newCart = { ...currentCart, products: newProducts }
      dispatch(updateCart(newCart))
      localStorage.setItem('currentCart', JSON.stringify(newCart))
    } else {
      const body = { products: newProducts }

      const response = await axios.put(`${process.env.REACT_APP_DEV_URL}/cart/${currentCart?._id}`, body)
      const newCart = response.data

      dispatch(updateCart(newCart))
    }
  }

  return (
    loading ? <CartProductSkeleton /> : (
      <div className="flex py-5 mb-5 border-0 border-b border-solid border-gray-300">
        <Link to={`/shoe/${shoe.shoeID}`} className="sm:w-1/4"><img src={shoe?.image?.thumbnail} alt={shoe?.name} className="" /></Link>

        <div className="ml-5 w-full sm:ml-2">
          <div>
            <div className="flex justify-between gap-4">
              <Link to={`/shoe/${shoe.shoeID}`}>
                <span className="font-medium hover:underline">{shoe?.name}</span>
              </Link>
              <span>${Number(shoe?.retailPrice) * productInfo?.quantity}.00</span>
            </div>
            <div className="text-gray-500"><span className="capitalize">{shoe?.gender}</span>'s Shoes</div>
            <div className="text-gray-500 sm:hidden">{shoe?.colorway}</div>
            <div>
              <span className="sm:block">
                <label className="mr-2 text-gray-500 sm:mr-1">Size</label>
                <select name="shoeSizes" className="border-none rounded-lg text-gray-500 sm:pr-10 sm:py-0" value={productInfo.size} onChange={handleChangeSize}>
                  {SHOE_SIZES.map((shoeSize) => <option key={`${shoeSize}-${short.generate()}`} value={shoeSize}>{shoeSize}</option>)}
                </select>
              </span>

              <span className="sm:block">
                <label className="mx-2 text-gray-500 sm:mx-0 sm:mr-1">Quantity</label>

                <select name="quantities" className="border-none rounded-lg text-gray-500 sm:pr-10 sm:py-0" value={productInfo.quantity} onChange={handleChangeQuantity}>
                  {QUANTITIES.map((quantity) => <option key={`${quantity}-${short.generate()}`} value={quantity}>{quantity}</option>)}
                </select>
              </span>
            </div>
          </div>

          <div className="">
            <button className="text-gray-500 mr-5 underline cursor-pointer" onClick={handleRemoveProduct}>Remove</button>
          </div>
        </div>
      </div>
    )
  )
}

export default CartProduct