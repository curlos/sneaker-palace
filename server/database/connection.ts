export { }

const mongoose = require("mongoose");
const ATLAS_URI = process.env.ATLAS_URI;

module.exports = {
  connectToServer: () => {
    mongoose.connect(ATLAS_URI, { useUnifiedTopology: true, useNewUrlParser: true })

    const connection = mongoose.connection
    connection.once('open', () => {
      console.log('Connected to MongoDB!')
    })
  }
};