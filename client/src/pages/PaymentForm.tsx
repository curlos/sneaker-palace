
   
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js"
import axios from "axios"
import React, { useState } from 'react'
import { useSelector } from "react-redux"
import { RootState } from "../redux/store"


const CARD_OPTIONS: any = {
	iconStyle: "solid",
	style: {
    base: {
      iconColor: '#c4f0ff',
      color: '#fff',
      fontWeight: '500',
      backgroundColor: 'black',
      fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
      fontSize: '16px',
      fontSmoothing: 'antialiased',
      ':-webkit-autofill': {
        color: '#fce883',
      },
      '::placeholder': {
        color: '#87BBFD',
      },
    },
    invalid: {
      iconColor: '#FFC7EE',
      color: '#FFC7EE',
    },
  },
}

export const PaymentForm = () => {

    const { currentCart, total } = useSelector((state: RootState) => state.cart)

    const [success, setSuccess ] = useState(false)
    const stripe = useStripe()
    const elements = useElements()


    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()

      if (elements && elements.getElement(CardElement)) {
        const cardElement = elements.getElement(CardElement)
      
        if (stripe && cardElement) {
          const {error, paymentMethod} = await stripe.createPaymentMethod({
            type: "card",
            card: cardElement
          })

          if (!error && paymentMethod) {
            try {
              const {id} = paymentMethod
              console.log(paymentMethod)
              console.log(id)
              const response = await axios.post("http://localhost:8888/checkout/payment", {
                  amount: 1000,
                  id: id
              })

              console.log(response.data)

              if(response.data.success) {
                  console.log("Successful payment")
                  setSuccess(true)
              }

            } catch (error) {
                console.log("Error", error)
            }
          } else if (error) {
              console.log(error.message)
          }
        }
      }
      
    }

  return (
      <>
      {!success ? 
      <form onSubmit={handleSubmit} className="p-5">
          <fieldset className="FormGroup">
              <div className="FormRow">
                  <CardElement options={CARD_OPTIONS}/>
              </div>
          </fieldset>
          <button>Pay</button>
      </form>
      :
      <div>
          <h2>You just bought a sweet spatula congrats this is the best decision of you're life</h2>
      </div> 
      }
          
      </>
  )
}