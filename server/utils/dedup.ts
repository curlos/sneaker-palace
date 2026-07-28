import Shoe from '../models/Shoe';

Shoe.aggregate([
	{
		$group: {
			_id: { shoeID: '$shoeID' },
			dups: { $push: '$_id' },
			count: { $sum: 1 },
		},
	},
	{ $match: { count: { $gt: 1 } } },
]).then((docs: any[]) => {
	docs.forEach((doc: any) => {
		doc.dups.shift();
		Shoe.deleteMany({ _id: { $in: doc.dups } });
	});
});
