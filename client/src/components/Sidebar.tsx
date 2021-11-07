import React, { useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon, CheckIcon } from "@heroicons/react/solid";

interface Props {
  filters: {
    colors: any,
    brands: any,
    genders: any,
    priceRanges: any,
    shoeSizes: any
  },
  setFilters: any
}

const Sidebar = ({ filters, setFilters }: Props) => {

  console.log(filters)
  
  const [showColors, setShowColors] = useState(false)
  const [showBrands, setShowBrands] = useState(false)
  const [showGender, setShowGender] = useState(false)
  const [showPriceRanges, setShowPriceRanges] = useState(false)
  const [showSizes, setShowSizes] = useState(false)

  const handleColorClick = (color: string) => {
    setFilters({...filters, colors: {...filters.colors, [color]: !filters.colors[color] }})
  }

  const handleBrandClick = (brand: string) => {
    setFilters({...filters, brands: {...filters.brands, [brand]: !filters.brands[brand] }})
  }

  const handleGenderClick = (gender: string) => {
    setFilters({...filters, genders: {...filters.genders, [gender]: !filters.genders[gender] }})
  }

  const handlePriceClick = (priceRange: string) => {
    setFilters({...filters, priceRanges: {...filters.priceRanges, [priceRange]: {...filters.priceRanges[priceRange], checked: !filters.priceRanges[priceRange].checked} }})
  }

  const handleSizeClick = (size: string) => {
    setFilters({...filters, shoeSizes: {...filters.shoeSizes, [size]: !filters.shoeSizes[size] }})
  }

  return (
    <aside className="top-0 p-5 w-full flex-2 flex-grow-1 overflow-y-auto bg-white">

      <div className="border-0 border-b border-solid border-gray-300 py-3">
        
        <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowColors(!showColors)}>
          <div className="font-bold mb-3">Color</div> {showColors ? <ChevronUpIcon className="h-6 w-6"/> : <ChevronDownIcon className="h-6 w-6"/>}
        </div>
        {showColors ? (
          <div className="flex flex-wrap justify-center gap-5 p-3">
            {Object.keys(filters.colors).map((color) => {
              return (
                <div className="flex flex-col items-center h-13 w-13">
                  <div className={`h-7 w-7 rounded-full bg-${color === 'black' || color === 'white' ? color : (color + '-500')} ${color === 'white' ? 'border border-gray-300' : ''} ${color === 'white' ? 'text-black' : 'text-white'}`} onClick={() => handleColorClick(color)}>
                    {filters.colors[color] ? <CheckIcon /> : null}
                  </div>
                  <div className="capitalize">{color}</div>
                </div>
              )
            })} 
          </div>
        ) : null}
        
      </div>

      <div className="border-0 border-b border-solid border-gray-300 py-3">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowBrands(!showBrands)}>
          <span className="font-bold mb-3">Brand</span> {showBrands ? <ChevronUpIcon className="h-6 w-6"/> : <ChevronDownIcon className="h-6 w-6"/>}
        </div>

        {showBrands ? (
          <div>
            {Object.keys(filters.brands).map((brand) => {
              return (
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 cursor-pointer" checked={filters.brands[brand]} onClick={() => handleBrandClick(brand)}></input>
                  <span>{brand}</span>
                </label>
                
              )
            })}
          </div>
        ) : null}
      </div>

      <div className="border-0 border-b border-solid border-gray-300 py-3">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowGender(!showGender)}>
          <span className="font-bold mb-3">Gender</span> {showGender ? <ChevronUpIcon className="h-6 w-6"/> : <ChevronDownIcon className="h-6 w-6"/>}
        </div>

        {showGender ? (
          <div>
            {Object.keys(filters.genders).map((gender) => {
              return (
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 cursor-pointer" checked={filters.genders[gender]} onClick={() => handleGenderClick(gender)}></input>
                  <span>{gender}</span>
                </label>
                
              )
            })}
          </div>
        ) : null}
      </div>

      <div className="border-0 border-b border-solid border-gray-300 py-3">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowPriceRanges(!showPriceRanges)}>
          <span className="font-bold mb-3">Shop by Price</span> {showPriceRanges ? <ChevronUpIcon className="h-6 w-6"/> : <ChevronDownIcon className="h-6 w-6"/>}
        </div>

        {showPriceRanges ? (
          <div>
            {Object.keys(filters.priceRanges).map((priceRange) => {
              return (
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 cursor-pointer" checked={filters.priceRanges[priceRange].checked} onClick={() => handlePriceClick(priceRange)}></input>
                  <span>{priceRange}</span>
                </label>
                
              )
            })}
          </div>
        ) : null}
      </div>

      <div className="py-3">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowSizes(!showSizes)}>
          <span className="font-bold mb-3">Size</span> {showSizes ? <ChevronUpIcon className="h-6 w-6"/> : <ChevronDownIcon className="h-6 w-6"/>}
        </div>

        {showSizes ? (
          <div className="flex flex-wrap">
            {Object.keys(filters.shoeSizes).map((shoeSize) => {
              return (
                <div className={`h-10 w-12 inline-flex items-center justify-center ${filters.shoeSizes[shoeSize] ? ' border-2 border-black' : 'border border-gray-300'} m-1 rounded-lg cursor-pointer`} onClick={() => handleSizeClick(shoeSize)}>{shoeSize}</div>
              )
            })}
          </div>
        ) : null}
      </div>
    </aside>
  )
}

export default Sidebar;