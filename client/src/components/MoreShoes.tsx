import axios from "axios"
import { useEffect, useState } from "react"
import CircleLoader from "../skeleton_loaders/CircleLoader"
import { Shoe } from "../types/types"
import SmallShoe from "./SmallShoe"


const MoreShoes = () => {

  const [shoes, setShoes] = useState<Array<Shoe>>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchShoes = async () => {
      const randomPageNum = Math.floor(Math.random() * 800)
      const response = await axios.get(`${process.env.REACT_APP_DEV_URL}/shoes/page/${randomPageNum}`)
      const randomShoes = response.data.docs.slice(0, 3)
      console.log(response.data.docs.slice(0, 3))
      setShoes(randomShoes)
      setLoading(false)
    }
    fetchShoes()
  }, [])



  return (
    loading ? <div className="flex justify-center py-4"><CircleLoader size={16} /></div> : (
      <div className="flex flex-wrap sm:justify-between">
        {shoes?.map((shoe) => <SmallShoe shoe={shoe} />)}
      </div>
    )
  )
}

export default MoreShoes