const axios = require('axios')
const mongoose = require('mongoose')
const database = require('../database/connection')
const Shoe = require('Shoe')

const shoes = {}

const timer = ms => new Promise(res => setTimeout(res, ms))

const getAllBrands = async () => {
  const options = {
    method: 'GET',
    url: 'https://the-sneaker-database.p.rapidapi.com/brands',
    headers: {
      'x-rapidapi-host': 'the-sneaker-database.p.rapidapi.com',
      'x-rapidapi-key': '7b5c381447mshbd5800218d682e4p13654ejsnb9e8c218cf2f'
    }
  };
  
  try {
    const response = await axios.request(options)
    const allBrands = await response.data.results
    return allBrands
  } catch (err) {
    console.error(err)
  }
}

const getAllGenders = async () => {
  const options = {
    method: 'GET',
    url: 'https://the-sneaker-database.p.rapidapi.com/genders',
    headers: {
      'x-rapidapi-host': 'the-sneaker-database.p.rapidapi.com',
      'x-rapidapi-key': '7b5c381447mshbd5800218d682e4p13654ejsnb9e8c218cf2f'
    }
  };
  
  try {
    const response = await axios.request(options)
    const allGenders = await response.data.results
    return allGenders
  } catch (err) {
    console.error(err)
  }
}

const addSneakerToDatabase = async (options, collectionName) => {
  const Sneaker = mongoose.model('Sneaker', sneakerV2Schema, collectionName)
  
  try {
    const response = await axios.request(options)
    const brandSneakers = response.data.results

    brandSneakers.forEach(async (sneaker) => {
      const {id, sku, brand, name, colorway, gender, silhouette, releaseYear, releaseDate, retailPrice, estimatedMarketValue, story, image, links} = sneaker

      const newSneaker = Sneaker(
        {
          sneakerID: id, 
          sku, 
          brand, 
          name, 
          colorway, 
          gender, 
          silhouette, 
          releaseYear, 
          releaseDate, 
          retailPrice, 
          estimatedMarketValue, 
          story, 
          image, 
          links,
        }
      )

      await newSneaker.save((err, result) => {
        if (err) return console.error(err)
        console.log(result.name + " saved to sneaker collection")
      })
    })

    return response.data.results
  } catch (err) {
    console.error(err)
  }
}

const getSneakersFromGender = async (gender) => {
  const options = {
    method: 'GET',
    url: 'https://the-sneaker-database.p.rapidapi.com/sneakers',
    params: {limit: '100', gender: gender},
    headers: {
      'x-rapidapi-host': 'the-sneaker-database.p.rapidapi.com',
      'x-rapidapi-key': '7b5c381447mshbd5800218d682e4p13654ejsnb9e8c218cf2f'
    }
  };

  return addSneakerToDatabase(options, gender)
}

const getSneakersFromBrand = async (brand) => {
  const options = {
    method: 'GET',
    url: 'https://the-sneaker-database.p.rapidapi.com/sneakers',
    params: {limit: '100', brand: brand},
    headers: {
      'x-rapidapi-host': 'the-sneaker-database.p.rapidapi.com',
      'x-rapidapi-key': '7b5c381447mshbd5800218d682e4p13654ejsnb9e8c218cf2f'
    }
  };

  return addSneakerToDatabase(options, brand)
}

const getSneakersFromAllBrands = async () => {
  const allBrands = await getAllBrands()

  for (let brand of allBrands) {
    console.log(`Getting sneakers from '${brand}'`)
    const brandSneakers = await getSneakersFromBrand(brand)
    sneakers[brand] = brandSneakers

    await timer(2000)
  }

  console.log(sneakers)
  console.log('All sneakers have been retrieved!')
}

const getSneakersFromAllGenders = async () => {
  const allGenders = await getAllGenders()

  for (let gender of allGenders) {
    console.log(`Getting sneakers for '${gender}'`)
    const genderSneakers = await getSneakersFromGender(gender)
    sneakers[gender] = genderSneakers

    await timer(2000)
  }

  console.log(sneakers)
  console.log('All sneakers have been retrieved!')
}

module.exports = {
  getAllGenders,
  getAllBrands,
  getSneakersFromBrand,
  getSneakersFromAllBrands,
  getSneakersFromAllGenders
}