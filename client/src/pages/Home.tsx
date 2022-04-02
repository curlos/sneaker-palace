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
      <div className="px-24 md:px-6">
        <div className="flex justify-between text-xl font-semibold mt-4 md:text-lg">
          <div>Popular Brands</div>
          <Link to={`/shoes`} className="underline">See All</Link>
        </div>
        <div className="flex flex-wrap gap-2 items-center justify-between md:mt-4">
          <div className="w-14/100 md:w-5/12">
            <Link to={{ pathname: "/shoes", state: { brand: 'Nike' } }} >
              <img src="/assets/brand_logos/nike.svg" className="w-full" alt="" />
            </Link>
          </div>

          <div className="w-14/100 md:w-5/12">
            <Link to={{ pathname: "/shoes", state: { brand: 'AIR JORDAN' } }} >
              <img src="/assets/brand_logos/jordan.svg" className="w-full" alt="" />
            </Link>
          </div>

          <div className="w-14/100 md:w-5/12">

            <Link to={{ pathname: "/shoes", state: { brand: 'ADIDAS' } }} >
              <img src="/assets/brand_logos/adidas.svg" className="w-full" alt="" />
            </Link>
          </div>

          <div className="w-14/100 md:w-5/12">
            <Link to={{ pathname: "/shoes", state: { brand: 'NEW BALANCE' } }} >
              <img src="/assets/brand_logos/new balance.svg" className="w-full" alt="" />
            </Link>
          </div>

          <div className="w-14/100 md:w-5/12">
            <Link to={{ pathname: "/shoes", state: { brand: 'LOUIS VUITTON' } }} >
              <img src="/assets/brand_logos/louis vuitton.svg" className="w-full" alt="" />
            </Link>
          </div>

          <div className="w-14/100 md:w-5/12">
            <Link to={{ pathname: "/shoes", state: { brand: 'GUCCI' } }} >
              <img src="/assets/brand_logos/gucci.svg" className="w-full" alt="" />
            </Link>
          </div>


        </div>

        <div className="mt-5 flex w-full mb-10 md:block">
          <div className="w-4/12 md:w-full md:mb-8">
            <Link to={{ pathname: "/shoes", state: { gender: 'men' } }} className="hover:underline font-bold text-xl md:text-3xl">
              <img src="/assets/landing_page/mens.jpeg" alt="Mens Shoe" className="w-full md:mb-2" />
              <span>Shop Men</span>
            </Link>
          </div>

          <div className="w-4/12 md:w-full md:mb-8">
            <Link to={{ pathname: "/shoes", state: { gender: 'women' } }} className="hover:underline font-bold text-xl md:text-3xl">
              <img src="/assets/landing_page/womens.jpeg" alt="Mens Shoe" className="w-full md:mb-2" />
              <span>Shop Women</span>
            </Link>
          </div>

          <div className="w-4/12 md:w-full md:mb-8">
            <Link to={{ pathname: "/shoes", state: { gender: 'youth' } }} className="text-xl font-bold md:text-3xl">
              <img src="/assets/landing_page/kids.jpeg" alt="Mens Shoe" className="w-full md:mb-2" />
              <span>Shop Kids</span>
            </Link>
          </div>


        </div>
      </div>
    </div>
  )
}

export default Home;