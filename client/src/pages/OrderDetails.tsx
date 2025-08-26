import moment from 'moment'
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useGetOrderByIdQuery } from '../api/ordersApi'
import { useGetUserProfileQuery } from '../api/userApi'
import { useGetShoesBulkQuery } from '../api/shoesApi'
import MoreShoes from '../components/MoreShoes'
import SmallOrderShoe from '../components/SmallOrderShoe'
import CircleLoader from '../skeleton_loaders/CircleLoader'
import { IProduct, Shoe } from '../types/types'

const OrderDetails = () => {

  const { id }: { id: string } = useParams()
  
  const { data: order, isLoading: orderLoading } = useGetOrderByIdQuery(id as string)
  
  const { data: customer } = useGetUserProfileQuery(order?.userID as string, {
    skip: !order?.userID
  })
  
  const productIds: string[] = order?.products?.map((product: IProduct) => product.productID) || []
  const uniqueProductIds = Array.from(new Set(productIds))
  const { data: shoesData, isLoading: shoesLoading } = useGetShoesBulkQuery(
    { ids: uniqueProductIds, key: 'shoeID' },
    { skip: uniqueProductIds.length === 0 }
  )

  // Create lookup map for O(1) access instead of O(N) find operations
  const shoeLookup = new Map<string, Shoe>()
  shoesData?.forEach((shoe: Shoe) => {
    shoeLookup.set(shoe.shoeID, shoe)
  })

  // Map each productId to its corresponding shoe (handles duplicates)
  const orderedShoes = productIds.map((productId: string) => {
    const shoe = shoeLookup.get(productId)
    if (!shoe) {
      console.warn(`Shoe not found for productID: ${productId}`)
    }
    return shoe
  }).filter((shoe): shoe is Shoe => shoe !== undefined)

  const loading = orderLoading || shoesLoading

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    loading ? <div className="flex justify-center h-screen p-10"><CircleLoader size={16} /></div> : (
      order ? (
        <div className="container mx-auto px-4 py-10 max-w-6xl flex-grow">
          <div className="text-3xl mb-3">Order Details</div>
          <span className="border-0 border-r border-gray-300 pr-3 sm:border-none">Ordered on {moment(order.orderDate).format('MMMM Do YYYY')}</span>
          <span className="px-3 sm:block sm:px-0">Order# {order._id}</span>

          <div className="py-4 flex sm:flex-col sm:gap-4">
            <div className="flex-2">
              <div className="font-bold">Shipping Address</div>
              <div>{customer ? `${customer.firstName} ${customer.lastName}` : 'Guest'}</div>
              <div>{order.billingDetails.address.postal_code}</div>
              <div>{order.billingDetails.address.country}</div>
            </div>

            <div className="flex-2">
              <div className="font-bold">Payment Method</div>
              <div>{order.card.brand.toUpperCase()} **** {order.card.last4}</div>
            </div>

            <div className="flex-2">
              <div className="font-bold">Order Summary</div>
              <div className="">
                <div className="flex justify-between">
                  <div>Item(s) Subtotal:</div>
                  <div>${order.amount}.00</div>
                </div>

                <div className="flex justify-between">
                  <div>Shipping & Handling:</div>
                  <div>${0}.00</div>
                </div>

                <div className="flex justify-between">
                  <div>Total before Tax:</div>
                  <div>${order.amount}.00</div>
                </div>

                <div className="flex justify-between">
                  <div>Estimated tax to be collected:</div>
                  <div>${0}.00</div>
                </div>

                <div className="flex justify-between">
                  <div className="font-bold">Grand Total:</div>
                  <div className="font-bold">${order.amount}.00</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 border border-gray-300 rounded-lg">
            {orderedShoes?.map((shoe: Shoe, index: number) => <SmallOrderShoe key={`${shoe._id}-${index}`} shoe={shoe} />)}
          </div>

          <div className="py-10">
            <div className="text-2xl">More shoes</div>
            <MoreShoes />
          </div>

        </div>
      ) : (
        <div></div>
      )
    )

  )
}

export default OrderDetails
