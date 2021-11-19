export { }

const Shoe = require('../models/Shoe')

Shoe.aggregate([
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
  Shoe.remove({ "_id": { "$in": doc.dups } });
});