export { }

const mongoose = require('mongoose')


mongoose.connection.db.collection('shoe-shop.shoes').aggregate([
  {
    "$group": {
      "_id": { "shoeID": "$shoeID" },
      "dups": { "$push": "$_id" },
      "count": { "$sum": 1 }
    }
  },
  { "$match": { "count": { "$gt": 1 } } }
]).forEach((doc: any) => {
  doc.dups.shift();
  mongoose.connection.db.remove({ "_id": { "$in": doc.dups } });
});