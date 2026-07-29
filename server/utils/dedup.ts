import mongoose from 'mongoose';
import Shoe from '../models/Shoe';

interface DuplicateShoeGroup {
	_id: { shoeID: string };
	dups: mongoose.Types.ObjectId[];
	count: number;
}

Shoe.aggregate<DuplicateShoeGroup>([
	{
		$group: {
			_id: { shoeID: '$shoeID' },
			dups: { $push: '$_id' },
			count: { $sum: 1 },
		},
	},
	{ $match: { count: { $gt: 1 } } },
]).then((docs) => {
	docs.forEach((doc) => {
		doc.dups.shift();
		Shoe.deleteMany({ _id: { $in: doc.dups } });
	});
});
