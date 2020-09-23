exports.userSignupValidator = (req, res, next) => {
	const pword = req.body.password;
	console.log(req.body.password);
	console.log(req.body.rTpassword);
	req.check('name', 'Name is Required!').notEmpty();
	req.check('email', 'Email is Required!').notEmpty();
	req
		.check('email', 'Email must be between 5 to 32 characters')
		.matches(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/)
		.withMessage('Please Enter Valid Email!, e.g., example123@gmail.com')
		.isLowercase('email')
		.withMessage('Email should be in Lowercase!')
		.isLength({
			min: 5,
			max: 32
		});
	req.check('phoneNo', 'Phone No Is Required!').notEmpty();
	req.check('phoneNo').isLength({ min: 10, max: 10 }).withMessage('Phone Number should be of 10 digits!');
	req.check('password', 'Password is Required!').notEmpty();
	req
		.check('password')
		.isLength({ min: 6 })
		.withMessage('Password must contain at least 6 characters')
		.matches(/\d/)
		.withMessage('Password must contain a number');
	req.check('rTpassword').matches(pword).withMessage('Both Password Must Be Same!');
	const errors = req.validationErrors();
	if (errors) {
		const firstError = errors.map((error) => error.msg)[0];
		return res.status(400).json({ error: firstError });
	}
	next();
};
