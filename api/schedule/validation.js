const joi = require("joi");
const { Interval } = require("luxon");

//	Must be called after restrict middleware
const newSlot = (req, res, next) => {
	const schema = joi.object({
		interval: joi.string().required(),
	});

	const { error } = schema.validate(req.body);

	if (error) {
		res.status(400).json(error.details[0]);
	} else {
		const interval = Interval.fromISO(req.body.interval);
		if (interval.isValid) {
			const { getUserUUID } = require("./model");

			getUserUUID(req.decoded.subject)
				.then((uuid) => {
					req.body = {
						interval: interval,
						volunteer: uuid,
					};
					next();
				})
				.catch((e) => res.status(500).json(e.message));
		} else {
			res.status(400).json({ message: "Invalid ISO 8601 interval" });
		}
	}
};

module.exports = { newSlot };
