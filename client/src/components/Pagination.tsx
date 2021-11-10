import React, { useState, useEffect } from 'react'
import { Shoe } from '../types/types'

interface Props {
  data: Array<Shoe>,
  handleNewPageClick: (paginatedShoes: Array<Shoe>) => void,
  pageLimit: number,
  dataLimit: number,
  currentPage: number,
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>
}

export const Pagination = ({ data, handleNewPageClick, pageLimit, dataLimit, currentPage, setCurrentPage }: Props) => {
  const [pages] = useState(Math.round(data.length / dataLimit))
  

  console.log(data)

  useEffect(() => {
    console.log('rerender')
    setPaginatedData()
  }, [currentPage])

  const goToNextPage = () => {
    if (currentPage === pageLimit) {
      return
    }

    setCurrentPage((page) => page + 1)
  }

  const goToPreviousPage = () => {
    if (currentPage === 1) {
      return
    }

    setCurrentPage((page) => page - 1)
  }

  const changePage = (e: any) => {
    const pageNumber = Number(e.target.textContent)
    setCurrentPage(pageNumber)
  }

  const setPaginatedData = () => {
    const startIndex = currentPage * dataLimit - dataLimit;
    const endIndex = startIndex + dataLimit;
    console.log(data.slice(startIndex, endIndex))
    console.log('updating posts')
    handleNewPageClick(data.slice(startIndex, endIndex))
  }

  const getPaginationGroup = () => {
    let start = Math.floor((currentPage - 1) / pageLimit) * pageLimit;
    return new Array(pageLimit).fill(undefined).map((_, idx) => start + idx + 1);
  };

  return (
    <div className="flex justify-between items-center my-4 text-black">
      <div className="pagResults">Showing <strong>{(currentPage * dataLimit - dataLimit) + 1}</strong> to <strong>{(currentPage * dataLimit - dataLimit) + dataLimit - 1 === data.length ? data.length : (currentPage * dataLimit - dataLimit) + dataLimit}</strong> of <strong>{data.length}</strong> results</div>

      <div className="flex">
        <div className="p-3 px-3 border border-gray-300 border-r-0 cursor-pointer rounded-tl-lg rounded-bl-lg" onClick={goToPreviousPage}><i className="fas fa-chevron-left"></i></div>

        {getPaginationGroup().map((pageNum) => <div className={`p-3 px-4 border border-gray-300 cursor-pointer ${currentPage === pageNum ? 'border-2 border-gray-700 font-bold' : 'border-r-0'}`} onClick={changePage}>{pageNum}</div>)}
        
        <div className="p-3 px-3 border border-gray-300 border-r-1 rounded-tr-lg rounded-br-lg cursor-pointer" onClick={goToNextPage}><i className="fas fa-chevron-right"></i></div>

      </div>
    </div>
  )
}