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
      const response = await axios.get(`http://localhost:8888/shoes`)
      const randomShoes = await getRandomShoes(response.data)
      setShoes(randomShoes)
      setLoading(false)
    }
    fetchShoes()
  }, [])

  const getRandomShoes = (allShoes: Array<Shoe>) => {
    const randomShoes: Array<Shoe> = []

    while (randomShoes.length < 3) {
      const shoe = allShoes[Math.floor(Math.random() * allShoes.length)]

      if (!randomShoes.includes(shoe)) {
        randomShoes.push(shoe)
      }
    }

    return randomShoes
  }

  console.log(shoes)

  return (
    loading ? <div className="flex justify-center py-4"><CircleLoader size={16} /></div> : (
      <div className="flex flex-wrap">
        {shoes?.map((shoe) => <SmallShoe shoe={shoe} />)}
      </div>
    )
  )
}

export default MoreShoes