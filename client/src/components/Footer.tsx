import React from 'react'
import { Link } from 'react-router-dom'

const FOOTER_BRANDS = [
  {
    brand: 'NIKE',
    displayName: 'Nike',
    shoes: [
      { id: 'd8efc352-2ae6-473a-b20a-70b810f388ee', name: 'Nike Kobe 5 Protro Undefeated Hall of Fame' },
      { id: '5f6da0cf-a27a-4bfc-aaec-bc4ce69ca76a', name: 'Nike LeBron 8 South Beach (2021)' },
      { id: 'bcad6ce2-7820-4d6e-9e0f-d006f08b7cc5', name: 'Nike Air Force 1 High 1017 ALYX 9SM Black Grey (2021)' },
      { id: '02415a72-3055-45f4-9a7e-9f4c00516963', name: 'Nike Air Zoom Infinity Tour NRG US Open Torrey Pines Pack' },
      { id: 'eb2323e5-cc54-45af-8405-9943a7c74bb6', name: 'Nike Air Zoom G.T. Cut Blue Void Purple Red' }
    ]
  },
  {
    brand: 'AIR JORDAN',
    displayName: 'Air Jordan',
    shoes: [
      { id: '7305e161-ad08-4552-a2ac-3abb2b5e4774', name: "Air Jordan 5 Retro 'Racer Blue'" },
      { id: 'cdb5c9c4-5304-4a4a-b62a-f1cf128b8f1e', name: "Air Jordan 1 Retro High OG 'Dark Marina Blue'" },
      { id: 'c3c519fd-b4a4-467c-b693-9e06c6565871', name: "Air Jordan 1 High Retro OG 'Brotherhood'" },
      { id: 'b1c96d6e-ea09-4cfa-a9ae-c56be1395421', name: "Air Jordan 13 Retro PS 'Court Purple'" },
      { id: '2d1b99b1-5430-4929-aa4d-ea1735b884f5', name: "Air Jordan 36 'First Light'" }
    ]
  },
  {
    brand: 'ADIDAS',
    displayName: 'Adidas',
    shoes: [
      { id: '32ddf852-5f39-4c85-9c05-b6f190888f83', name: "UltraBoost 4.0 DNA 'Black Matte Gold'" },
      { id: '1e8a27dd-c915-40b3-9687-9ed41387aa9e', name: "Wmns UltraBoost 4.0 DNA Wide 'White Copper Metallic'" },
      { id: '4ebbd816-f524-4f78-b838-5435f82fd02c', name: 'adidas Yeezy QNTM Onyx' },
      { id: '248500c2-4e79-4266-99d8-bde4b72d83e0', name: "Swarovski x Wmns UltraBoost Slip-On DNA 'Triple Black'" },
      { id: '93907822-1be8-43c8-97f6-a93972bc568a', name: 'adidas Trae Young 1 Acid Orange' }
    ]
  },
  {
    brand: 'NEW BALANCE',
    displayName: 'New Balance',
    shoes: [
      { id: 'f5e34778-1633-4390-a168-e0318eb42097', name: 'New Balance 991 Brown Navy Grey' },
      { id: '3bb6446c-aa15-4aba-8e22-9e3df1ef8a08', name: "990v5 Made in USA 2E Wide 'Ice Blue'" },
      { id: '92d16bb7-2171-4855-9e02-bb964368375f', name: 'New Balance Kawhi Energy Red' },
      { id: '349705e7-06b8-49e2-8f6b-b628fb921499', name: "Wmns Fresh Foam 880v11 GTX Wide 'Black Night Tide'" },
      { id: 'e08357fe-5f37-4f80-af5c-be61f3316861', name: "Wmns Fresh Foam X LAV v2 Wide 'Pink Glow Deep Violet'" }
    ]
  },
  {
    brand: 'LOUIS VUITTON',
    displayName: 'Louis Vuitton',
    shoes: [
      { id: '01e69c29-34f7-4c56-ad13-df80709da782', name: 'Louis Vuitton Arclight Trainer Gold (W)' },
      { id: '63988e03-68a8-4c94-8028-2d1ff3f86ec3', name: "Louis Vuitton Wonderland Flat Ranger 'Monogram'" },
      { id: '540b8a13-b906-4296-85e2-0d228c8c2b0f', name: 'Louis Vuitton x NBA Oberkampf Ankle Boot Beige' },
      { id: '3a4c49b6-857d-4c61-9215-ea084b58542d', name: "Louis Vuitton LV408 'New York'" },
      { id: 'fcf97b5f-78b9-4dbc-8d0a-c1dd790ec350', name: 'Louis Vuitton LV Trainer Sneaker Boot High White Blue' }
    ]
  },
  {
    brand: 'GUCCI',
    displayName: 'Gucci',
    shoes: [
      { id: '02286336-2b0c-4b5c-8b29-319f97ce3b54', name: "Gucci Wmns Flashtrek 'SEGA'" },
      { id: 'bc0ce7b8-95fd-4a82-b9ad-72fe5ca30089', name: "Gucci Rhyton Leather Sneaker 'NY Yankees'" },
      { id: '0f45dcfb-f8e7-4f7b-879a-a34364db1e62', name: "Gucci Leather Nappa Silk High 'Silver'" },
      { id: '0c64ea43-2206-4a8e-859a-8930e195a129', name: "Gucci Wmns Tinsel Sandal 'White'" },
      { id: '0af7f6d3-a055-47dc-9cbb-b9723982ce15', name: 'Gucci Rhyton Wave' }
    ]
  }
]

export const Footer = () => {
  return (
    <div className="bg-black text-white text-xs pt-10 lg:text-lg">
      <div className="flex justify-center py-5 px-10 border-0 border-b border-solid border-gray-400 lg:hidden">
        {FOOTER_BRANDS.map((brandData) => (
          <div key={brandData.brand} className="w-1/6 px-4 lg:w-full lg:flex lg:flex-col lg:mb-4">
            <div>
              <Link 
                to={{ pathname: "/shoes", state: { brand: brandData.brand } }} 
                className="text-sm lg:text-2xl"
              >
                {brandData.displayName}
              </Link>
            </div>
            {brandData.shoes.map((shoe) => (
              <div key={shoe.id} className="mt-1">
                <Link to={`/shoe/${shoe.id}`} className="text-gray-400">
                  {shoe.name}
                </Link>
              </div>
            ))}
          </div>
        ))}
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
