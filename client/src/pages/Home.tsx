import { Link } from "react-router-dom";

const Home = () => {

  return (
    <div>
      <div className="bg-kobe-hof-shoes h-screen bg-cover flex items-center text-white font-bold sm:h-800">
        <div className="ml-10 pb-10 w-1/4 sm:w-3/4">
          <div className="text-5xl mb-3 sm:text-5xl">Nike Kobe 5 Protro Undefeated 'Hall of Fame'</div>
          <Link to={`/shoe/d8efc352-2ae6-473a-b20a-70b810f388ee`} className="underline">Shop Now</Link>
        </div>
      </div>
      {/* <img src="/assets/landing_page/kobes.jpeg" /> */}

      <div className="px-24 sm:px-6">
        <div className="flex justify-between text-xl font-semibold mt-4 sm:text-lg">
          <div>Popular Brands</div>
          <Link to={`/shoes`} className="underline">See All</Link>
        </div>
        <div className="flex flex-wrap gap-2 items-center sm:justify-between sm:mt-4">
          <div className="w-2/12 sm:w-5/12">
            <img src="/assets/brand_logos/nike.svg" className="w-full" />
          </div>

          <div className="w-2/12 sm:w-5/12">
            <img src="/assets/brand_logos/jordan.svg" className="w-full" />
          </div>

          <div className="w-2/12 sm:w-5/12">
            <img src="/assets/brand_logos/adidas.svg" className="w-full" />
          </div>

          <div className="w-2/12 sm:w-5/12">
            <img src="/assets/brand_logos/new balance.svg" className="w-full" />
          </div>

          <div className="w-2/12 sm:w-5/12">
            <img src="/assets/brand_logos/louis vuitton.svg" className="w-full" />
          </div>

          <div className="w-2/12 sm:w-5/12">
            <img src="/assets/brand_logos/gucci.svg" className="w-full" />
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