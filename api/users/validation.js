const country = (req, res, next) => {
	const countryCodes = require("../modules/country-codes");

	if (!countryCodes.find((code) => code === req.params.country)) {
		res.status(400).json("Invalid ISO-3166-1 alpha-2 country code");
	} else {
		next();
	}
};

module.exports = { country };
