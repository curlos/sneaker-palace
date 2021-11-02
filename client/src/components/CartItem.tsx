import React from 'react'


const SHOE_SIZES = ['4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13', '13.5', '14', '14.5', '15', '16', '17' ]
const QUANTITIES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

interface Props {
  item: Object
}

const CartItem = ({ item }: Props) => {

  return (
    <div className="flex py-5 mb-5 border-0 border-b border-solid border-gray-300">
      <img src="https://images.nike.com/is/image/DotCom/DQ4686_300_A_PREM?align=0,1&cropN=0,0,0,0&resMode=sharp&bgc=f5f5f5&wid=150&fmt=jpg" />

      <div className="ml-5">
        <div>
          <div className="font-medium">Nike Air Max 270</div>
          <div className="text-gray-500">Men's Shoes</div>
          <div className="text-gray-500">Rough Green/Sequoia/Hot Curry/Dark Russet</div>
          <div>
            <label className="mr-2 text-gray-500">Size</label>
            <select name="shoeSizes" className="border-none rounded-lg text-gray-500">
              {SHOE_SIZES.map((shoeSize) => <option value={shoeSize}>{shoeSize}</option>)}
            </select>

            <label className="mx-2 text-gray-500">Quantity</label>

            <select name="quantities" className="border-none rounded-lg text-gray-500">
              {QUANTITIES.map((quantity) => <option value={quantity}>{quantity}</option>)}
            </select>
          </div>
        </div>

        <div className="">
          <span className="text-gray-500 mr-5 underline cursor-pointer">Move to Favorites</span>
          <span className="text-gray-500 mr-5 underline cursor-pointer">Remove</span>
        </div>
      </div>
    </div>
  )
}

export default CartItem