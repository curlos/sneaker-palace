import axios from 'axios';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import StarRatings from 'react-star-ratings';
import { RootState } from '../redux/store';
import CircleLoader from '../skeleton_loaders/CircleLoader';
import ShoeImage from '../components/ShoeImage';
import { Shoe, UserType } from '../types/types';
import { postImage } from '../utils/postImage';

const ReviewForm = () => {
  const history = useHistory()
  const user: Partial<UserType> = useSelector((state: RootState) => state.user && state.user.currentUser)

  const { shoeID, reviewID }: { shoeID: string, reviewID: string } = useParams()
  const [shoe, setShoe] = useState<Partial<Shoe>>({})

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




  useEffect(() => {
    window.scrollTo(0, 0)
    const fetchFromAPI = async () => {
      const response = await axios.get(`${process.env.REACT_APP_DEV_URL}/shoes/${shoeID}`)

      setShoe(response.data)

      if (reviewID) {
        const reviewResponse = await axios.get(`${process.env.REACT_APP_DEV_URL}/rating/${reviewID}`)
        setReviewInfo({ ...reviewInfo, ...reviewResponse.data })
      } else {
        setReviewInfo({ ...reviewInfo, shoeID: response.data.shoeID })
      }
      setLoading(false)
    }
    fetchFromAPI()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shoeID])

  const handleSubmitReview = async () => {
    try {
      let imagePath = null

      if (file) {
        const results = await postImage(file)

        imagePath = results.imagePath
      }

      const body = {
        ...reviewInfo,
        photo: imagePath
      }

      const response = await axios.post(`${process.env.REACT_APP_DEV_URL}/rating/rate`, body)


      if (!response.data.errors) {
        history.push(`/shoe/${shoe.shoeID}`)
      }

    } catch (err) {

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

        imagePath = results.imagePath
      }

      const body = {
        ...reviewInfo,
        photo: imagePath
      }

      const response = await axios.put(`${process.env.REACT_APP_DEV_URL}/rating/edit/${reviewID}`, body)


      if (!response.data.errors) {
        history.push(`/shoe/${shoe.shoeID}`)
      }

    } catch (err) {

    }
  }





  return (
    loading ? (
      <div className="flex justify-center py-10 h-screen"><CircleLoader size={16} /></div>
    ) : (
      <div className="flex-grow">
        <div className="px-48 py-10 sm:px-4 xl:p-12">
          <div className="font-bold text-2xl">WRITE YOUR REVIEW</div>
          <div className="flex justify-between items-center border border-gray-300 p-4 rounded-lg my-4">
            <div className="font-bold text-lg">{shoe.name}</div>
            <ShoeImage src={shoe.image?.original || ''} alt={shoe.name || ''} className="h-150 w-150" />
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
                  changeRating={(newRating) => setReviewInfo({ ...reviewInfo, ratingNum: newRating })}
                  numberOfStars={5}
                  name='rating'
                  starDimension="18px"
                />
              </div>


              <form className="flex-2">
                <div className="flex items-center mb-2">
                  <input name="recommended" type="radio" value="Yes" className="mr-2 h-4 w-4" checked={reviewInfo.recommended === true} onChange={() => setReviewInfo({ ...reviewInfo, recommended: true })} />
                  <label>Yes</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="recommended" type="radio" value="No" className="mr-2 h-4 w-4" checked={reviewInfo.recommended === false} onChange={() => setReviewInfo({ ...reviewInfo, recommended: false })} />
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
                  <input name="sizeInput" type="radio" className="mr-2 h-4 w-4" onChange={() => setReviewInfo({ ...reviewInfo, size: 'Too small' })} checked={reviewInfo.size === 'Too small'} />
                  <label className="text-sm">Too small</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="sizeInput" type="radio" className="mr-2 h-4 w-4" checked={reviewInfo.size === '1/2 a size too small'} readOnly />
                  <label className="text-sm" onChange={() => setReviewInfo({ ...reviewInfo, size: '1/2 a size too small' })}>1/2 a size too small</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="sizeInput" type="radio" className="mr-2 h-4 w-4" onChange={() => setReviewInfo({ ...reviewInfo, size: 'Perfect' })} checked={reviewInfo.size === 'Perfect'} />
                  <label className="text-sm">Perfect</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="sizeInput" type="radio" className="mr-2 h-4 w-4" onChange={() => setReviewInfo({ ...reviewInfo, size: '1/2 a size too big' })} checked={reviewInfo.size === '1/2 a size too big'} />
                  <label className="text-sm">1/2 a size too big</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="sizeInput" type="radio" className="mr-2 h-4 w-4" onChange={() => setReviewInfo({ ...reviewInfo, size: 'Too big' })} checked={reviewInfo.size === 'Too big'} />
                  <label className="text-sm">Too big</label>
                </div>
              </div>


              <div className="flex-2">
                <div className="flex items-center mb-2">
                  <input name="widthInput" type="radio" className="mr-2 h-4 w-4" onChange={() => setReviewInfo({ ...reviewInfo, width: 'Too narrow' })} checked={reviewInfo.width === 'Too narrow'} />
                  <label className="text-sm">Too narrow</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="widthInput" type="radio" className="mr-2 h-4 w-4" onChange={() => setReviewInfo({ ...reviewInfo, width: 'Slightly narrow' })} checked={reviewInfo.width === 'Slightly narrow'} />
                  <label className="text-sm">Slightly narrow</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="widthInput" type="radio" className="mr-2 h-4 w-4" onChange={() => setReviewInfo({ ...reviewInfo, width: 'Perfect' })} checked={reviewInfo.width === 'Perfect'} />
                  <label className="text-sm">Perfect</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="widthInput" type="radio" className="mr-2 h-4 w-4" onChange={() => setReviewInfo({ ...reviewInfo, width: 'Slightly wide' })} checked={reviewInfo.width === 'Slightly wide'} />
                  <label className="text-sm">Slightly wide</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="widthInput" type="radio" className="mr-2 h-4 w-4" onChange={() => setReviewInfo({ ...reviewInfo, width: 'Too wide' })} checked={reviewInfo.width === 'Too wide'} />
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
                  <input name="comfortInput" type="radio" className="mr-2 h-4 w-4" onChange={() => setReviewInfo({ ...reviewInfo, comfort: 'Uncomfortable' })} checked={reviewInfo.comfort === 'Uncomfortable'} />
                  <label className="text-sm">Uncomfortable</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="comfortInput" type="radio" className="mr-2 h-4 w-4" onChange={() => setReviewInfo({ ...reviewInfo, comfort: 'Slightly uncomfortable' })} checked={reviewInfo.comfort === 'Slightly uncomfortable'} />
                  <label className="text-sm">Slightly uncomfortable</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="comfortInput" type="radio" className="mr-2 h-4 w-4" onChange={() => setReviewInfo({ ...reviewInfo, comfort: 'Ok' })} checked={reviewInfo.comfort === 'Ok'} />
                  <label className="text-sm">Ok</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="comfortInput" type="radio" className="mr-2 h-4 w-4" onChange={() => setReviewInfo({ ...reviewInfo, comfort: 'Comfortable' })} checked={reviewInfo.comfort === 'Comfortable'} />
                  <label className="text-sm">Comfortable</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="comfortInput" type="radio" className="mr-2 h-4 w-4" onChange={() => setReviewInfo({ ...reviewInfo, comfort: 'Perfect' })} checked={reviewInfo.comfort === 'Perfect'} />
                  <label className="text-sm">Perfect</label>
                </div>
              </div>


              <div className="flex-2">
                <div className="flex items-center mb-2">
                  <input name="qualityInput" type="radio" className="mr-2 h-4 w-4" onChange={() => setReviewInfo({ ...reviewInfo, quality: 'Poor' })} checked={reviewInfo.quality === 'Poor'} />
                  <label className="text-sm">Poor</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="qualityInput" type="radio" className="mr-2 h-4 w-4" onChange={() => setReviewInfo({ ...reviewInfo, quality: 'Below average' })} checked={reviewInfo.quality === 'Below average'} />
                  <label className="text-sm">Below average</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="qualityInput" type="radio" className="mr-2 h-4 w-4" onChange={() => setReviewInfo({ ...reviewInfo, quality: 'What I expected' })} checked={reviewInfo.quality === 'What I expected'} />
                  <label className="text-sm">What I expected</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="qualityInput" type="radio" className="mr-2 h-4 w-4" onChange={() => setReviewInfo({ ...reviewInfo, quality: 'Pretty great' })} checked={reviewInfo.quality === 'Pretty great'} />
                  <label className="text-sm">Pretty great</label>
                </div>

                <div className="flex items-center mb-2">
                  <input name="qualityInput" type="radio" className="mr-2 h-4 w-4" onChange={() => setReviewInfo({ ...reviewInfo, quality: 'Perfect' })} checked={reviewInfo.quality === 'Perfect'} />
                  <label className="text-sm">Perfect</label>
                </div>
              </div>


            </div>





          </div>
        </div>

        <div className="border-0 border-b border-solid border-gray-300">
          &nbsp;
        </div>

        <div className="px-48 py-10 sm:px-4 xl:p-12">
          <div className="font-bold text-xl mb-4">YOUR REVIEW</div>
          <div className="flex mb-4 sm:flex-col">
            <div className="flex-2 w-full sm:mb-5">
              <div className="text-gray-500 w-10/12sm:w-full">Summary</div>
              <input placeholder="Summary" className="border border-black p-3 w-10/12 sm:w-full" value={reviewInfo.summary} onChange={(e) => setReviewInfo({ ...reviewInfo, summary: e.target.value })} />
              <div className="text-sm text-gray-500 w-10/12 sm:w-full">What's your opinion in one sentence? Example: Best purchase ever.</div>
            </div>

            <div className="flex-2 w-full sm:mb-5">
              <div className="text-gray-500 w-10/12">Upload photo</div>
              {(file || reviewInfo.photo) && (
                <img src={file ? URL.createObjectURL(file) : `${process.env.REACT_APP_DEV_URL}${reviewInfo.photo}`} alt="" className="h-150 object-cover my-3" />
              )}
              <input onChange={handleSelectFile} type="file" accept="image/*" className="w-full"></input>
              <div className="text-sm text-gray-500 w-10/12 sm:w-full">Upload your .PNG or .JPG file</div>
            </div>
          </div>

          <div className="w-1/2 sm:w-full">
            <div className="text-gray-500 w-10/12 sm:w-full">Your Review</div>
            <textarea className="resize-none border w-10/12 h-40 sm:w-full" onChange={(e) => setReviewInfo({ ...reviewInfo, text: e.target.value })} value={reviewInfo.text}></textarea>
            <div className="text-sm text-gray-500 w-10/12 sm:w-full">Tell other people more about the product. What about the quality? Or the comfort?</div>
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
