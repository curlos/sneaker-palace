import axios from 'axios'
import React, { useState, useEffect, ChangeEvent } from 'react'
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom'
import StarRatings from 'react-star-ratings';
import { RootState } from '../redux/store';
import { IRating, Shoe, UserType } from '../types/types'
import { postImage } from '../utils/postImage';

const ReviewForm = () => {
  const history = useHistory()
  const user: Partial<UserType> = useSelector((state: RootState) => state.user && state.user.currentUser)
  
  const { shoeID, reviewID }: { shoeID: string, reviewID: string } = useParams()
  const [shoe, setShoe] = useState<Partial<Shoe>>({})
  const [ratingNum, setRatingNum] = useState(0)
  const [reviewInfo, setReviewInfo] = useState<any>({
    userID: user._id,
    shoeID: '',
    ratingNum: 0,
    summary: '',
    text: '',
    photo: '',
    size: '',
    comfort: '',
    width: '',
    quality: '',
    recommended: null,
  })
  const [file, setFile] = useState<File>()
  const [loading, setLoading] = useState(true)

  console.log(shoeID)
  console.log(reviewID)

  useEffect(() => {
    const fetchFromAPI = async () => {
      const response = await axios.get(`http://localhost:8888/shoes/${shoeID}`)
      console.log(response.data)
      setShoe(response.data)

      if (reviewID) {
        const reviewResponse = await axios.get(`http://localhost:8888/rating/${reviewID}`)
        setReviewInfo({...reviewInfo, ...reviewResponse.data})
      } else {
        setReviewInfo({...reviewInfo, shoeID: response.data.shoeID})
      }
      setLoading(false)
    }
    fetchFromAPI()
  }, [shoeID])

  const handleSubmitReview = async () => {
    try {
      let imagePath = null

      if (file) {
        const results = await postImage(file)
        console.log(results)
        imagePath = results.imagePath
      }

      const body = {
        ...reviewInfo,
        photo: imagePath
      }

      const response = await axios.post(`http://localhost:8888/rating/rate`, body)
      console.log(response.data.errors)

      if (!response.data.errors) {
        history.push(`/shoe/${shoe.shoeID}`)
      }
      
    } catch (err) {
      console.log(err)
    }
  }

  const handleSelectFile = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0]
    setFile(file)
  }

  const handleEditReview = async () => {
    try {
      let imagePath = null

      if (file) {
        const results = await postImage(file)
        console.log(results)
        imagePath = results.imagePath
      }

      const body = {
        ...reviewInfo,
        photo: imagePath
      }

      const response = await axios.put(`http://localhost:8888/rating/edit/${reviewID}`, body)
      console.log(response.data)

      if (!response.data.errors) {
        history.push(`/shoe/${shoe.shoeID}`)
      }
      
    } catch (err) {
      console.log(err)
    }
  }


  console.log(reviewInfo)
  console.log()
  
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
                    rating={reviewInfo.ratingNum}
                    starRatedColor="#F5B327"
                    starHoverColor="#F5B327"
                    changeRating={(newRating) => setReviewInfo({...reviewInfo, ratingNum: newRating})}
                    numberOfStars={5}
                    name='rating'
                    starDimension="25px"
                />
              </div>


              <form className="flex-2">
                <div className="flex items-center mb-2">
                  <input name="recommended" type="radio" value="Yes" className="mr-2 h-4 w-4" checked={reviewInfo.recommended === true} onClick={() => setReviewInfo({...reviewInfo, recommended: true})}/>
                  <label>Yes</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="recommended" type="radio" value="No" className="mr-2 h-4 w-4" checked={reviewInfo.recommended === false} onClick={() => setReviewInfo({...reviewInfo, recommended: false})}/>
                  <label>No</label>
                </div>
              </form>
            </div>




            <div className="flex mt-10">
              <div className="font-medium flex-2">SIZE</div>
              <div className="font-medium mb-2 flex-2">WIDTH</div>
            </div>

            <div className="flex my-2">
              <div className="flex-2">
                <div className="flex items-center mb-2">
                  <input name="sizeInput" type="radio" className="mr-2 h-4 w-4" onClick={() => setReviewInfo({...reviewInfo, size: 'Too small'})} checked={reviewInfo.size === 'Too small'}/>
                  <label className="text-sm">Too small</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="sizeInput" type="radio" className="mr-2 h-4 w-4" checked={reviewInfo.size === '1/2 a size too small'}/>
                  <label className="text-sm" onClick={() => setReviewInfo({...reviewInfo, size: '1/2 a size too small'})}>1/2 a size too small</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="sizeInput" type="radio" className="mr-2 h-4 w-4" onClick={() => setReviewInfo({...reviewInfo, size: 'Perfect'})} checked={reviewInfo.size === 'Perfect'}/>
                  <label className="text-sm">Perfect</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="sizeInput" type="radio" className="mr-2 h-4 w-4" onClick={() => setReviewInfo({...reviewInfo, size: '1/2 a size too big'})} checked={reviewInfo.size === '1/2 a size too big'}/>
                  <label className="text-sm">1/2 a size too big</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="sizeInput" type="radio" className="mr-2 h-4 w-4" onClick={() => setReviewInfo({...reviewInfo, size: 'Too big'})} checked={reviewInfo.size === 'Too big'}/>
                  <label className="text-sm">Too big</label>
                </div>
              </div>


              <div className="flex-2">
                <div className="flex items-center mb-2">
                  <input name="widthInput" type="radio" className="mr-2 h-4 w-4" onClick={() => setReviewInfo({...reviewInfo, width: 'Too narrow'})} checked={reviewInfo.width === 'Too narrow'}/>
                  <label className="text-sm">Too narrow</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="widthInput" type="radio" className="mr-2 h-4 w-4" onClick={() => setReviewInfo({...reviewInfo, width: 'Slightly narrow'})} checked={reviewInfo.width === 'Slightly narrow'}/>
                  <label className="text-sm">Slightly narrow</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="widthInput" type="radio" className="mr-2 h-4 w-4" onClick={() => setReviewInfo({...reviewInfo, width: 'Perfect'})} checked={reviewInfo.width === 'Perfect'}/>
                  <label className="text-sm">Perfect</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="widthInput" type="radio" className="mr-2 h-4 w-4" onClick={() => setReviewInfo({...reviewInfo, width: 'Slightly wide'})} checked={reviewInfo.width === 'Slightly wide'}/>
                  <label className="text-sm">Slightly wide</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="widthInput" type="radio" className="mr-2 h-4 w-4" onClick={() => setReviewInfo({...reviewInfo, width: 'Too wide'})} checked={reviewInfo.width === 'Too wide'}/>
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
                  <input name="comfortInput" type="radio" className="mr-2 h-4 w-4" onClick={() => setReviewInfo({...reviewInfo, comfort: 'Uncomfortable'})} checked={reviewInfo.comfort === 'Uncomfortable'}/>
                  <label className="text-sm">Uncomfortable</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="comfortInput" type="radio" className="mr-2 h-4 w-4" onClick={() => setReviewInfo({...reviewInfo, comfort: 'Slightly uncomfortable'})} checked={reviewInfo.comfort === 'Slightly uncomfortable'}/>
                  <label className="text-sm">Slightly uncomfortable</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="comfortInput" type="radio" className="mr-2 h-4 w-4" onClick={() => setReviewInfo({...reviewInfo, comfort: 'Ok'})} checked={reviewInfo.comfort === 'Ok'}/>
                  <label className="text-sm">Ok</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="comfortInput" type="radio" className="mr-2 h-4 w-4" onClick={() => setReviewInfo({...reviewInfo, comfort: 'Comfortable'})} checked={reviewInfo.comfort === 'Comfortable'}/>
                  <label className="text-sm">Comfortable</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="comfortInput" type="radio" className="mr-2 h-4 w-4" onClick={() => setReviewInfo({...reviewInfo, comfort: 'Perfect'})} checked={reviewInfo.comfort === 'Perfect'}/>
                  <label className="text-sm">Perfect</label>
                </div>
              </div>


              <div className="flex-2">
                <div className="flex items-center mb-2">
                  <input name="qualityInput" type="radio" className="mr-2 h-4 w-4" onClick={() => setReviewInfo({...reviewInfo, quality: 'Poor'})} checked={reviewInfo.quality === 'Poor'}/>
                  <label className="text-sm">Poor</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="qualityInput" type="radio" className="mr-2 h-4 w-4" onClick={() => setReviewInfo({...reviewInfo, quality: 'Below average'})} checked={reviewInfo.quality === 'Below average'}/>
                  <label className="text-sm">Below average</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="qualityInput" type="radio" className="mr-2 h-4 w-4" onClick={() => setReviewInfo({...reviewInfo, quality: 'What I expected'})} checked={reviewInfo.quality === 'What I expected'}/>
                  <label className="text-sm">What I expected</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="qualityInput" type="radio" className="mr-2 h-4 w-4" onClick={() => setReviewInfo({...reviewInfo, quality: 'Pretty great'})} checked={reviewInfo.quality === 'Pretty great'}/>
                  <label className="text-sm">Pretty great</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="qualityInput" type="radio" className="mr-2 h-4 w-4" onClick={() => setReviewInfo({...reviewInfo, quality: 'Perfect'})} checked={reviewInfo.quality === 'Perfect'}/>
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
              <input placeholder="Summary *" className="border border-black p-3 w-10/12" value={reviewInfo.summary} onChange={(e) => setReviewInfo({...reviewInfo, summary: e.target.value})}/>
              <div className="text-sm text-gray-500 w-10/12">What's your opinion in one sentence? Example: Best purchase ever.</div>
            </div>

            <div className="flex-2 w-full">
            <div className="text-gray-500 w-10/12">Upload photo</div>
              {(file || reviewInfo.photo) && (
                <img src={file ? URL.createObjectURL(file) : `http://localhost:8888${reviewInfo.photo}` } alt="" className="h-150 object-cover my-3"/>
              )}
              <input onChange={handleSelectFile} type="file" accept="image/*"></input>
              <div className="text-sm text-gray-500 w-10/12">Upload your .PNG or .JPG file</div>
            </div>
          </div>

          <div className="w-1/2">
            <div className="text-gray-500 w-10/12">Your Review *</div>
            <textarea className="resize-none border w-10/12 h-40" onChange={(e) => setReviewInfo({...reviewInfo, text: e.target.value})} value={reviewInfo.text}></textarea>
            <div className="text-sm text-gray-500 w-10/12">Tell other people more about the product. What about the quality? Or the comfort?</div>
          </div>

          <button className="bg-black text-white rounded-full flex-2 py-3 mr-5 my-5 hover:bg-gray-700 p-7" onClick={reviewID ? handleEditReview : handleSubmitReview}>
            {reviewID ? 'EDIT REVIEW' : 'SUBMIT REVIEW'}
          </button>
  

        </div>
        
      </div>
    )
  )
}

export default ReviewForm
