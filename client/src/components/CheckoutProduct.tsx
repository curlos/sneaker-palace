import { useGetShoeQuery } from '../api/shoesApi'
import CircleLoader from '../skeleton_loaders/CircleLoader'
import ShoeImage from './ShoeImage'
import { IProduct } from '../types/types'

interface Props {
  product: IProduct,
  type: string
}

const CheckoutProduct = ({ product, type }: Props) => {

  const { data: shoe, isLoading: loading } = useGetShoeQuery(product.productID)

  return (

    loading ? <div className="flex py-10 h-screen"><CircleLoader size={16} /></div> : (
      type === 'small' ? (
        <div className="flex gap-6 mb-7 text-sm">
          <div className="flex-2">
            <ShoeImage src={shoe?.image?.original || ''} alt={shoe?.name || ''} />
          </div>

          <div className="text-gray-600 flex-4">
            <div className="text-black">{shoe?.name}</div>
            <div>Size: {product.size}</div>
            <div>Colorway: {shoe?.colorway}</div>
            <div>Qty: {product.quantity} @ {shoe && shoe.retailPrice && Number(product.quantity * shoe?.retailPrice).toFixed(2)}</div>
            <div>{shoe && shoe.retailPrice && Number(product.quantity * shoe?.retailPrice).toFixed(2)}</div>
          </div>
        </div>
      ) : (
        <div className="flex justify-between mb-7 text-base">
          <div className="flex gap-5">
            <div>
              <ShoeImage src={shoe?.image?.original || ''} alt={shoe?.name || ''} className="h-40 w-40" />
            </div>

            <div className="text-gray-600">
              <div className="text-black font-medium">{shoe?.name}</div>
              <div>Size: {product.size}</div>
              <div className="sm:hidden">Colorway: {shoe?.colorway}</div>
              <div>Quantity: {product.quantity}</div>
            </div>
          </div>

          <div className="text-lg font-medium">{shoe && shoe.retailPrice && Number(product.quantity * shoe?.retailPrice).toFixed(2)}</div>
        </div>
      )
    )
  )
}

export default CheckoutProduct