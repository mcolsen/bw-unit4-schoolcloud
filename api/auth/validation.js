const joi = require("joi");
const bcrypt = require("bcryptjs");
const { v4: uuid } = require("uuid");

const { getUserWithPassword } = require("./model");

const register = (req, res, next) => {
	const schema = joi.object({
		role: joi
			.string()
			.valid("admin", "student", "volunteer")
			.insensitive()
			.required(),
		username: joi.string().required(),
		password: joi.string().required(),
		country: joi.string().uppercase(),
	});

	const { error, value } = schema.validate(req.body);

	if (error) {
		res.status(400).json(error.details[0]);
	} else {
		req.body = value;
		req.body.uuid = uuid();
		req.body.password = bcrypt.hashSync(
			req.body.password,
			Number(process.env.BCRYPT_ROUNDS)
		);

		if (req.body.country) {
			const countryCodes = require("../modules/country-codes");
			if (!countryCodes.find((code) => code === req.body.country)) {
				res.status(400).json("Invalid ISO-3166-1 alpha-2 country code");
			} else {
				next();
			}
		} else if (req.body.role === "volunteer") {
			res.status(400).json("Country code required for volunteers");
		} else {
			next();
		}
	}
};

const login = (req, res, next) => {
	const schema = joi.object({
		username: joi.string().required(),
		password: joi.string().required(),
	});

	const { error } = schema.validate(req.body);

	if (error) {
		res.status(400).json(error.details[0]);
	} else {
		getUserWithPassword(req.body.username)
			.then((r) => {
				if (
					r.length === 1 &&
					bcrypt.compareSync(req.body.password, r[0].password)
				) {
					req.body = r[0];
					next();
				} else {
					res.status(401).json("Invalid credentials");
				}
			})
			.catch((e) => res.status(500).json(e.message));
	}
};

module.exports = { register, login };
