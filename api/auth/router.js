const express = require("express");
const jwt = require("jsonwebtoken");
const middleware = require("./middlewares");
const db = require("./model");

const router = express.Router();

const createToken = (user) => {
	const payload = { subject: user.username, role: user.role };
	const secret = process.env.JWT_SECRET;
	const options = { expiresIn: "24h" };

	return jwt.sign(payload, secret, options);
};

router.post("/register", middleware.register, (req, res) => {
	db.addUser(req.body)
		.then(() =>
			res.status(201).json({
				message: `Welcome ${req.body.username}`,
				token: createToken(req.body),
			})
		)
		.catch((e) => res.status(500).json(e.message));
});

router.post("/login", middleware.login, (req, res) => {
	res.status(200).json({
		message: `Welcome ${req.body.username}`,
		token: createToken(req.body),
	});
});

module.exports = router;
