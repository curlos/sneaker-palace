import React, { useState, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/react/solid'
import { Shoe } from '../types/types'

interface Props {
  data: Array<Shoe>,
  handleNewPageClick: (paginatedShoes: Array<Shoe>) => void,
  pageLimit: number,
  dataLimit: number,
  currentPage: number,
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>,
  filters: any,
  sortType: string
}

export const Pagination = ({ data, handleNewPageClick, pageLimit, dataLimit, currentPage, setCurrentPage, filters, sortType }: Props) => {
  const [pages] = useState(Math.round(data.length / dataLimit))

  useEffect(() => {
    console.log('rerender')
    console.log(sortType)
    setPaginatedData()
  }, [currentPage, filters, sortType, data])

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

  const goToFirstPage = () => {
    setCurrentPage((page) => 1)
  }

  const goToLastPage = () => {
    setCurrentPage((page) => pageLimit)
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
    console.log(data.slice(startIndex, endIndex))
    handleNewPageClick(data.slice(startIndex, endIndex))
  }

  const getPaginationGroup = () => {
    let start = Math.floor((currentPage - 1) / pageLimit) * pageLimit;


    return new Array(pageLimit).fill(undefined).map((_, idx) => start + idx + 1);
  };

  return (
    <div className="flex justify-between items-center my-4 text-black">
      <div className="pagResults">Showing <strong>{(currentPage * dataLimit - dataLimit) + 1}</strong> to <strong>{(currentPage * dataLimit - dataLimit) + dataLimit - 1 >= data.length ? data.length : (currentPage * dataLimit - dataLimit) + dataLimit}</strong> of <strong>{data.length}</strong> results</div>

      <div className="flex w-1/2 justify-end">
        <div className="p-3 border border-gray-300 border-r-0 cursor-pointer rounded-tl-lg rounded-bl-lg flex items-center justify-center" onClick={goToFirstPage}><ChevronDoubleLeftIcon className="h-5 w-5" /></div>

        <div className="p-3 px-3 border border-gray-300 border-r-0 cursor-pointer flex items-center justify-center" onClick={goToPreviousPage}><ChevronLeftIcon className="h-5 w-5" /></div>

        {pageLimit - currentPage < 5 ? (
          getPaginationGroup().slice(pageLimit - 5, pageLimit).map((pageNum) => <div className={`p-3 border border-gray-300 cursor-pointer ${currentPage === pageNum ? 'border-2 border-gray-700 font-bold' : 'border-r-0'}`} onClick={changePage}>{pageNum}</div>)
        ) : (
          getPaginationGroup().slice(currentPage - 1, currentPage + 4).map((pageNum) => <div className={`p-3 px-4 border border-gray-300 cursor-pointer ${currentPage === pageNum ? 'border-2 border-gray-700 font-bold' : 'border-r-0'}`} onClick={changePage}>{pageNum}</div>)
        )}

        <div className="p-3 border border-r-0 border-gray-300 cursor-pointer flex items-center justify-center" onClick={goToNextPage}><ChevronRightIcon className="h-5 w-5" /></div>

        <div className="p-3 border border-gray-300 border-r-1 rounded-tr-lg rounded-br-lg cursor-pointer flex items-center justify-center" onClick={goToLastPage}><ChevronDoubleRightIcon className="h-5 w-5" /></div>

      </div>
    </div>
  )
}