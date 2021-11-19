import React from 'react'
import { Link } from 'react-router-dom'

export const Footer = () => {
  return (
    <div className="bg-black text-white text-xs pt-10 lg:text-lg">
      <div className="flex justify-center py-5 px-10 border-0 border-b border-solid border-gray-400 lg:block">

        <div className="w-1/6 px-4 lg:w-full lg:flex lg:flex-col lg:mb-4">
          <div><Link to={{ pathname: "/shoes", state: { brand: 'NIKE' } }} className="text-sm lg:text-2xl">Nike</Link></div>
          <div><Link to="/shoe/7305e161-ad08-4552-a2ac-3abb2b5e4774" className="text-gray-400">Nike Kobe 5 Protro Undefeated Hall of Fame</Link></div>
          <div><Link to="/shoe/5f6da0cf-a27a-4bfc-aaec-bc4ce69ca76a" className="text-gray-400">Nike LeBron 8 South Beach (2021)</Link></div>
          <div><Link to="/shoe/bcad6ce2-7820-4d6e-9e0f-d006f08b7cc5" className="text-gray-400">Nike Air Force 1 High 1017 ALYX 9SM Black Grey (2021)</Link></div>
          <div><Link to="/shoe/02415a72-3055-45f4-9a7e-9f4c00516963" className="text-gray-400">Nike Air Zoom Infinity Tour NRG US Open Torrey Pines Pack</Link></div>
          <div><Link to="/shoe/eb2323e5-cc54-45af-8405-9943a7c74bb6" className="text-gray-400">Nike Air Zoom G.T. Cut Blue Void Purple Red</Link></div>
        </div>


        <div className="w-1/6 px-4 lg:w-full lg:flex lg:flex-col lg:mb-4">
          <div><Link to={{ pathname: "/shoes", state: { brand: 'AIR JORDAN' } }} className="text-sm lg:text-2xl">Air Jordan</Link></div>
          <div><Link to="/shoe/7305e161-ad08-4552-a2ac-3abb2b5e4774" className="text-gray-400">Air Jordan 5 Retro 'Racer Blue'</Link></div>
          <div><Link to="/shoe/cdb5c9c4-5304-4a4a-b62a-f1cf128b8f1e" className="text-gray-400">Air Jordan 1 Retro High OG 'Dark Marina Blue'</Link></div>
          <div><Link to="/shoe/c3c519fd-b4a4-467c-b693-9e06c6565871" className="text-gray-400">Air Jordan 1 High Retro OG 'Brotherhood'</Link></div>
          <div><Link to="/shoe/b1c96d6e-ea09-4cfa-a9ae-c56be1395421" className="text-gray-400">Air Jordan 13 Retro PS 'Court Purple'</Link></div>
          <div><Link to="/shoe/2d1b99b1-5430-4929-aa4d-ea1735b884f5" className="text-gray-400">Air Jordan 36 'First Light'</Link></div>
        </div>

        <div className="w-1/6 px-4 lg:w-full lg:flex lg:flex-col lg:mb-4">
          <div><Link to={{ pathname: "/shoes", state: { brand: 'ADIDAS' } }} className="text-sm lg:text-2xl">Adidas</Link></div>
          <div><Link to="/shoe/32ddf852-5f39-4c85-9c05-b6f190888f83" className="text-gray-400">UltraBoost 4.0 DNA 'Black Matte Gold'</Link></div>
          <div><Link to="/shoe/1e8a27dd-c915-40b3-9687-9ed41387aa9e" className="text-gray-400">Wmns UltraBoost 4.0 DNA Wide 'White Copper Metallic'</Link></div>
          <div><Link to="/shoe/4ebbd816-f524-4f78-b838-5435f82fd02c" className="text-gray-400">adidas Yeezy QNTM Onyx</Link></div>
          <div><Link to="/shoe/248500c2-4e79-4266-99d8-bde4b72d83e0" className="text-gray-400">Swarovski x Wmns UltraBoost Slip-On DNA 'Triple Black'</Link></div>
          <div><Link to="/shoe/93907822-1be8-43c8-97f6-a93972bc568a" className="text-gray-400">adidas Trae Young 1 Acid Orange</Link></div>
        </div>

        <div className="w-1/6 px-4 lg:w-full lg:flex lg:flex-col lg:mb-4">
          <div><Link to={{ pathname: "/shoes", state: { brand: 'NEW BALANCE' } }} className="text-sm lg:text-2xl">New Balance</Link></div>
          <div><Link to="/shoe/f5e34778-1633-4390-a168-e0318eb42097" className="text-gray-400">New Balance 991 Brown Navy Grey</Link></div>
          <div><Link to="/shoe/3bb6446c-aa15-4aba-8e22-9e3df1ef8a08" className="text-gray-400">990v5 Made in USA 2E Wide 'Ice Blue'</Link></div>
          <div><Link to="/shoe/92d16bb7-2171-4855-9e02-bb964368375f" className="text-gray-400">New Balance Kawhi Energy Red</Link></div>
          <div><Link to="/shoe/349705e7-06b8-49e2-8f6b-b628fb921499" className="text-gray-400">Wmns Fresh Foam 880v11 GTX Wide 'Black Night Tide'</Link></div>
          <div><Link to="/shoe/e08357fe-5f37-4f80-af5c-be61f3316861" className="text-gray-400">Wmns Fresh Foam X LAV v2 Wide 'Pink Glow Deep Violet'</Link></div>
        </div>

        <div className="w-1/6 px-4 lg:w-full lg:flex lg:flex-col lg:mb-4">
          <div><Link to={{ pathname: "/shoes", state: { brand: 'LOUIS VUITTON' } }} className="text-sm lg:text-2xl">Louis Vuitton</Link></div>
          <div><Link to="/shoe/01e69c29-34f7-4c56-ad13-df80709da782" className="text-gray-400">Louis Vuitton Arclight Trainer Gold (W)</Link></div>
          <div><Link to="/shoe/63988e03-68a8-4c94-8028-2d1ff3f86ec3" className="text-gray-400">Louis Vuitton Wonderland Flat Ranger 'Monogram'</Link></div>
          <div><Link to="/shoe/540b8a13-b906-4296-85e2-0d228c8c2b0f" className="text-gray-400">Louis Vuitton x NBA Oberkampf Ankle Boot Beige</Link></div>
          <div><Link to="/shoe/3a4c49b6-857d-4c61-9215-ea084b58542d" className="text-gray-400">Louis Vuitton LV408 'New York'</Link></div>
          <div><Link to="/shoe/fcf97b5f-78b9-4dbc-8d0a-c1dd790ec350" className="text-gray-400">Louis Vuitton LV Trainer Sneaker Boot High White Blue</Link></div>
        </div>

        <div className="w-1/6 px-4 lg:w-full lg:flex lg:flex-col lg:mb-4">
          <div><Link to={{ pathname: "/shoes", state: { brand: 'GUCCI' } }} className="text-sm lg:text-2xl">Gucci</Link></div>
          <div><Link to="/shoe/02286336-2b0c-4b5c-8b29-319f97ce3b54" className="text-gray-400">Gucci Wmns Flashtrek 'SEGA'</Link></div>
          <div><Link to="/shoe/bc0ce7b8-95fd-4a82-b9ad-72fe5ca30089" className="text-gray-400">Gucci Rhyton Leather Sneaker 'NY Yankees'</Link></div>
          <div><Link to="/shoe/0f45dcfb-f8e7-4f7b-879a-a34364db1e62" className="text-gray-400">Gucci Leather Nappa Silk High 'Silver'</Link></div>
          <div><Link to="/shoe/0c64ea43-2206-4a8e-859a-8930e195a129" className="text-gray-400">Gucci Wmns Tinsel Sandal 'White'</Link></div>
          <div><Link to="/shoe/0af7f6d3-a055-47dc-9cbb-b9723982ce15" className="text-gray-400">Gucci Rhyton Wave</Link></div>
        </div>


      </div>

      <div className="px-10 py-4 flex justify-between items-center lg:flex-col lg:gap-2 lg:text-xs">
        <div className="flex gap-4 text-gray-400">
          <div className="cursor-pointer">Terms</div>
          <div className="cursor-pointer">Privacy</div>
          <div className="cursor-pointer">Press</div>
          <div className="cursor-pointer">Jobs</div>
        </div>

        <div className="text-gray-400">&#169; Sneaker Palace LLC. All Rights Reserved</div>

        <div className="text-2xl">
          <i className="fab fa-twitter-square mr-3 cursor-pointer"></i>
          <i className="fab fa-facebook-square mr-3 cursor-pointer"></i>
          <i className="fab fa-instagram-square mr-3 cursor-pointer"></i>
          <i className="fab fa-youtube-square mr-3 cursor-pointer"></i>
        </div>

      </div>
    </div>
  )
}
