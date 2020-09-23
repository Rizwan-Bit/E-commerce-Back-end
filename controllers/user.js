const User = require('../models/user');
const { Order } = require('../models/order');
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.userById = (req, res, next, id) => {
	User.findById(id).exec((err, user) => {
		if (err || !user) {
			return res.status(400).json({
				error: 'User not found'
			});
		}
		req.profile = user;
		next();
	});
};

exports.read = (req, res) => {
	req.profile.hashed_password = undefined;
	req.profile.salt = undefined;
	return res.json(req.profile);
};

// exports.update = (req, res) => {
//     console.log('user update', req.body);
//     req.body.role = 0; // role will always be 0
//     User.findOneAndUpdate({ _id: req.profile._id }, { $set: req.body }, { new: true }, (err, user) => {
//         if (err) {
//             return res.status(400).json({
//                 error: 'You are not authorized to perform this action'
//             });
//         }
//         user.hashed_password = undefined;
//         user.salt = undefined;
//         res.json(user);
//     });
// };

exports.update = (req, res) => {
	// console.log('UPDATE USER - req.user', req.user, 'UPDATE DATA', req.body);
	const { name, phoneNo, password } = req.body;

	User.findOne({ _id: req.profile._id }, (err, user) => {
		if (err || !user) {
			return res.status(400).json({
				error: 'User not found'
			});
		}
		if (!name) {
			return res.status(400).json({
				error: 'Name is required'
			});
		} else {
			user.name = name;
		}

		if (password) {
			if (password.length < 6) {
				return res.status(400).json({
					error: 'Password should be min 6 characters long'
				});
			} else {
				user.password = password;
			}
		}

		if (!phoneNo) {
			return res.status(400).json({
				error: 'Phone No is required'
			});
		} else {
			if (phoneNo.length < 10 || phoneNo.length > 10) {
				return res.status(402).json({
					error: 'Phone Number Should be of 10 digits!'
				});
			} else {
				user.phoneNo = phoneNo;
			}
		}

		user.save((err, updatedUser) => {
			if (err) {
				console.log('USER UPDATE ERROR', err);
				return res.status(400).json({
					error: 'This Phone Number is Already Used!'
				});
			}
			updatedUser.hashed_password = undefined;
			updatedUser.salt = undefined;
			res.json(updatedUser);
		});
	});
};

exports.addOrderToUserHistory = (req, res, next) => {
	let history = [];

	req.body.order.products.forEach((item) => {
		history.push({
			_id: item._id,
			name: item.name,
			description: item.description,
			category: item.category,
			quantity: item.count,
			transaction_id: req.body.order.transaction_id,
			amount: req.body.order.amount
		});
	});

	User.findOneAndUpdate({ _id: req.profile._id }, { $push: { history: history } }, { new: true }, (error, data) => {
		if (error) {
			return res.status(400).json({
				error: 'Could not update user purchase history'
			});
		}
		next();
	});
};

exports.purchaseHistory = (req, res) => {
	Order.find({ user: req.profile._id }).populate('user', '_id name').sort('-created').exec((err, orders) => {
		if (err) {
			return res.status(400).json({
				error: errorHandler(err)
			});
		}
		res.json(orders);
	});
};

exports.list = (req, res) => {
	let order = req.query.order ? req.query.order : 'asc';
	let sortBy = req.query.sortBy ? req.query.sortBy : '_id';
	let limit = req.query.limit ? parseInt(req.query.limit) : 6;

	User.find().sort([ [ sortBy, order ] ]).limit(limit).exec((err, users) => {
		if (err) {
			return res.status(400).json({
				error: 'Users not found'
			});
		}
		res.json(users);
	});
};

// exports.remove = (req, res) => {
// 	let user = req.user;
// 	user.remove((err, deletedUser) => {
// 		if (err) {
// 			return res.status(400).json({
// 				error: errorHandler(err)
// 			});
// 		}
// 		res.json({
// 			message: 'User deleted successfully'
// 		});
// 	});
// };
