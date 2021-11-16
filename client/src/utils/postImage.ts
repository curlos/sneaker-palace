import axios from "axios"

export const postImage = async (image: File) => {
  const formData = new FormData()
  formData.append('image', image)

  const response = await axios.post(`${process.env.REACT_APP_DEV_URL}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  return response.data
}