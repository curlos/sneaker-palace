import axios from 'axios'
import React, { ChangeEvent, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { updateCart } from '../redux/cartRedux';
import { RootState } from '../redux/store';
import { Shoe, ICart, IProduct, CartState } from "../types/types";


const SHOE_SIZES = ['4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13', '13.5', '14', '14.5', '15', '16', '17' ]
const QUANTITIES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

interface Props {
  productInfo: IProduct
}

const CartProduct = ({ productInfo }: Props) => {

  const dispatch = useDispatch()
  const cart: Partial<CartState> = useSelector((state: RootState) => state.cart.currentCart)
  const currentCart = cart?.currentCart

  const [shoe, setShoe] = useState<Partial<Shoe>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFromAPI = async () => {
      const response = await axios.get(`http://localhost:8888/shoes/${productInfo.productID}`)
      console.log(response.data)
      setShoe(response.data)
      setLoading(false)
    }

    fetchFromAPI()
  }, [])

  const handleChangeSize = async () => {
    const response = await axios.put(`http://localhost:8888/cart/6188151282fac429716b04a0`)
  }

  const handleChangeQuantity = async (e: ChangeEvent<HTMLSelectElement>) => {

    if (currentCart && currentCart.products) {
      const currentCartClone = { ...currentCart }
      const newProducts = currentCartClone?.products
      console.log(currentCartClone)

      for (let product of newProducts) {
        if (product._id === productInfo._id) {
          product.quantity = Number(e.currentTarget.value)
        }
      }

      console.log(newProducts)
      // const body = { products: newProducts}
      // console.log(body)
      // const response = await axios.put(`http://localhost:8888/cart/${currentCart?._id}`, body)
      // const newCart = response.data
      // console.log(newCart)
      // dispatch(updateCart({currentCart: newCart}))
    }
  }

  const handleRemoveProduct = async () => {
    console.log('removing')
    console.log(currentCart)
    const newProducts = currentCart?.products?.filter((product) => product._id !== productInfo._id)
    const body = { products: newProducts}
    console.log(body)
    const response = await axios.put(`http://localhost:8888/cart/${currentCart?._id}`, body)
    const newCart = response.data
    console.log(newCart)
    dispatch(updateCart({currentCart: newCart}))
  }

  return (
    <div className="flex py-5 mb-5 border-0 border-b border-solid border-gray-300">
      <Link to={`/shoe/${shoe.shoeID}`}><img src={shoe?.image?.thumbnail} alt={shoe?.name} style={{height: '150px', width: '150px'}}/></Link>

      <div className="ml-5 w-full">
        <div>
          <div className="flex justify-between">
          <Link to={`/shoe/${shoe.shoeID}`}>
            <span className="font-medium hover:underline">{shoe?.name}</span> 
          </Link>
            <span>${Number(shoe?.retailPrice) * productInfo?.quantity}.00</span>  
          </div>
          <div className="text-gray-500"><span className="capitalize">{shoe?.gender}</span>'s Shoes</div>
          <div className="text-gray-500">{shoe?.colorway}</div>
          <div>
            <label className="mr-2 text-gray-500">Size</label>
            <select name="shoeSizes" className="border-none rounded-lg text-gray-500" onChange={handleChangeSize}>
              {SHOE_SIZES.map((shoeSize) => <option selected={productInfo.size === Number(shoeSize)} value={shoeSize}>{shoeSize}</option>)}
            </select>

            <label className="mx-2 text-gray-500">Quantity</label>

            <select name="quantities" className="border-none rounded-lg text-gray-500" onChange={handleChangeQuantity}>
              {QUANTITIES.map((quantity) => <option selected={productInfo.quantity === Number(quantity)} value={quantity}>{quantity}</option>)}
            </select>
          </div>
        </div>

        <div className="">
          <button className="text-gray-500 mr-5 underline cursor-pointer" onClick={handleRemoveProduct}>Remove</button>
        </div>
      </div>
    </div>
  )
}

export default CartProduct