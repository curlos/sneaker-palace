import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import StarRatings from 'react-star-ratings';
import { Shoe } from '../types/types'

const ReviewForm = () => {
  
  const { shoeID }: { shoeID: string } = useParams()
  const [shoe, setShoe] = useState<Partial<Shoe>>({})
  const [ratingNum, setRatingNum] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFromAPI = async () => {
      const response = await axios.get(`http://localhost:8888/shoes/${shoeID}`)
      console.log(response.data)
      setShoe(response.data)
      setLoading(false)
    }
    fetchFromAPI()
  }, [])


  console.log(shoe)
  
  return (
    loading ? <div>Loading...</div> : (
      <div className="">
        <div className="px-48 py-10">
          <div className="font-bold text-2xl">WRITE YOUR REVIEW</div>
          <div className="flex justify-between items-center border border-gray-300 p-4 rounded-lg my-4">
            <div className="font-bold text-lg">{shoe.name}</div>
            <img src={shoe.image?.original} alt={shoe.name} className="h-150 w-150" />
          </div>

          <div className="">
            <div className="flex">
              <div className="font-medium flex-2">YOUR OVERALL RATING</div>
              <div className="font-medium mb-2 flex-2">WOULD YOU RECOMMEND THIS PRODUCT?</div>
            </div>



            <div className="flex my-2">

              <div className="flex-2">
                <div className="text-sm mb-2">Please select</div>
                <StarRatings
                    rating={ratingNum}
                    starRatedColor="#10B981"
                    starHoverColor="#10B981"
                    changeRating={(newRating) => setRatingNum(newRating)}
                    numberOfStars={5}
                    name='rating'
                    starDimension="25px"
                />
              </div>


              <div className="flex-2">
                <div className="flex items-center mb-2">
                  <input type="radio" className="mr-2 h-4 w-4"/>
                  <label>Yes</label>
                </div>

                <div className="flex items-center mb-2">
                  <input type="radio" className="mr-2 h-4 w-4"/>
                  <label>No</label>
                </div>
              </div>
            </div>




            <div className="flex mt-10">
              <div className="font-medium flex-2">SIZE</div>
              <div className="font-medium mb-2 flex-2">WIDTH</div>
            </div>

            <div className="flex my-2">
              <div className="flex-2">
                <div className="flex items-center mb-2">
                  <input name="sizeInput" type="radio" className="mr-2 h-4 w-4"/>
                  <label className="text-sm">Too small</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="sizeInput" type="radio" className="mr-2 h-4 w-4"/>
                  <label className="text-sm">1/2 a size too small</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="sizeInput" type="radio" className="mr-2 h-4 w-4"/>
                  <label className="text-sm">Perfect</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="sizeInput" type="radio" className="mr-2 h-4 w-4"/>
                  <label className="text-sm">1/2 a size too big</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="sizeInput" type="radio" className="mr-2 h-4 w-4"/>
                  <label className="text-sm">Too big</label>
                </div>
              </div>


              <div className="flex-2">
                <div className="flex items-center mb-2">
                  <input name="widthInput" type="radio" className="mr-2 h-4 w-4"/>
                  <label className="text-sm">Too narrow</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="widthInput" type="radio" className="mr-2 h-4 w-4"/>
                  <label className="text-sm">Slightly narrow</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="widthInput" type="radio" className="mr-2 h-4 w-4"/>
                  <label className="text-sm">Perfect</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="widthInput" type="radio" className="mr-2 h-4 w-4"/>
                  <label className="text-sm">Slightly wide</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="widthInput" type="radio" className="mr-2 h-4 w-4"/>
                  <label className="text-sm">Too wide</label>
                </div>
              </div>
            </div>



            <div className="flex mt-10">
              <div className="font-medium flex-2">COMFORT</div>
              <div className="font-medium mb-2 flex-2">QUALITY</div>
            </div>

            <div className="flex my-2">
              <div className="flex-2">
                <div className="flex items-center mb-2">
                  <input name="comfortInput" type="radio" className="mr-2 h-4 w-4"/>
                  <label className="text-sm">Uncomfortable</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="comfortInput" type="radio" className="mr-2 h-4 w-4"/>
                  <label className="text-sm">Slightly uncomfortable</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="comfortInput" type="radio" className="mr-2 h-4 w-4"/>
                  <label className="text-sm">Ok</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="comfortInput" type="radio" className="mr-2 h-4 w-4"/>
                  <label className="text-sm">Comfortable</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="comfortInput" type="radio" className="mr-2 h-4 w-4"/>
                  <label className="text-sm">Perfect</label>
                </div>
              </div>


              <div className="flex-2">
                <div className="flex items-center mb-2">
                  <input name="qualityInput" type="radio" className="mr-2 h-4 w-4"/>
                  <label className="text-sm">Poor</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="qualityInput" type="radio" className="mr-2 h-4 w-4"/>
                  <label className="text-sm">Below average</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="qualityInput" type="radio" className="mr-2 h-4 w-4"/>
                  <label className="text-sm">What I expected</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="qualityInput" type="radio" className="mr-2 h-4 w-4"/>
                  <label className="text-sm">Pretty great</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="qualityInput" type="radio" className="mr-2 h-4 w-4"/>
                  <label className="text-sm">Perfect</label>
                </div>
              </div>

              
            </div>




          
          </div>
        </div>

        <div className="border-0 border-b border-solid border-gray-300">
          &nbsp;
        </div>

        <div className="px-48 py-10">
          <div className="font-bold text-xl mb-4">YOUR REVIEW</div>
          <div className="flex mb-4">
            <div className="flex-2 w-full">
              <div className="text-gray-500 w-10/12">Summary *</div>
              <input placeholder="Summary *" className="border border-black p-3 w-10/12"/>
              <div className="text-sm text-gray-500 w-10/12">What's your opinion in one sentence? Example: Best purchase ever.</div>
            </div>

            <div className="flex-2 w-full">
            <div className="text-gray-500 w-10/12">Upload photo</div>
              <input placeholder="Upload photo" className="border border-black p-3 w-10/12"/>
              <div className="text-sm text-gray-500 w-10/12">Upload your .PNG or .JPG file</div>
            </div>
          </div>

          <div className="w-1/2">
            <div className="text-gray-500 w-10/12">Your Review *</div>
            <textarea className="resize-none border w-10/12 h-40"></textarea>
            <div className="text-sm text-gray-500 w-10/12">Tell other people more about the product. What about the quality? Or the comfort?</div>
          </div>

          <button className="bg-black text-white rounded-full flex-2 py-3 mr-5 my-5 hover:bg-gray-700 p-7">
            SUBMIT REVIEW
          </button>
  

        </div>
        
      </div>
    )
  )
}

export default ReviewForm
