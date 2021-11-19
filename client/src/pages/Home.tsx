import { useEffect } from "react";
import { Link } from "react-router-dom";
import Carousel from "../components/Carousel";

const Home = () => {

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div>
      <Carousel />
      {/* <img src="/assets/landing_page/kobes.jpeg" /> */}

      <div className="px-24 sm:px-6">
        <div className="flex justify-between text-xl font-semibold mt-4 sm:text-lg">
          <div>Popular Brands</div>
          <Link to={`/shoes`} className="underline">See All</Link>
        </div>
        <div className="flex flex-wrap gap-2 items-center justify-between sm:mt-4">
          <div className="w-14/100 sm:w-5/12">
            <img src="/assets/brand_logos/nike.svg" className="w-full" alt="" />
          </div>

          <div className="w-14/100 sm:w-5/12">
            <img src="/assets/brand_logos/jordan.svg" className="w-full" alt="" />
          </div>

          <div className="w-14/100 sm:w-5/12">
            <img src="/assets/brand_logos/adidas.svg" className="w-full" alt="" />
          </div>

          <div className="w-14/100 sm:w-5/12">
            <img src="/assets/brand_logos/new balance.svg" className="w-full" alt="" />
          </div>

          <div className="w-14/100 sm:w-5/12">
            <img src="/assets/brand_logos/louis vuitton.svg" className="w-full" alt="" />
          </div>

          <div className="w-14/100 sm:w-5/12">
            <img src="/assets/brand_logos/gucci.svg" className="w-full" alt="" />
          </div>


        </div>

        <div className="mt-5 flex w-full mb-10 sm:block">
          <div className="w-4/12 sm:w-full sm:mb-8">
            <img src="/assets/landing_page/mens.jpeg" alt="Mens Shoe" className="w-full sm:mb-2" />
            <Link to={``} className="hover:underline font-medium text-xl sm:text-3xl sm:font-semibold">Shop Men</Link>
          </div>

          <div className="w-4/12 sm:w-full sm:mb-8">
            <img src="/assets/landing_page/womens.jpeg" alt="Mens Shoe" className="w-full sm:mb-2" />
            <Link to={``} className="hover:underline font-medium text-xl sm:text-3xl sm:font-semibold">Shop Women</Link>
          </div>

          <div className="w-4/12 sm:w-full sm:mb-8">
            <img src="/assets/landing_page/kids.jpeg" alt="Mens Shoe" className="w-full sm:mb-2" />
            <Link to={``} className="hover:underline font-medium text-xl sm:text-3xl sm:font-semibold">Shop Kids</Link>
          </div>


        </div>
      </div>
    </div>
  )
}

export default Home;