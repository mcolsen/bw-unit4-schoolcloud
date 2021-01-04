const express = require("express");
const restrict = require("../middlewares/restrict");
const validate = require("./validation");
const db = require("./model");

const router = express.Router();

router.get("/", restrict("admin"), (req, res) => {
	db.getAllUsers()
		.then((r) => res.status(200).json(r))
		.catch((e) => res.status(500).json(e.message));
});

router.get("/volunteers", restrict(["admin", "student"]), (req, res) => {
	db.getAllVolunteers()
		.then((r) => res.status(200).json(r))
		.catch((e) => res.status(500).json(e.message));
});

router.get(
	"/volunteers/:country",
	restrict(["admin", "student"]),
	validate.country,
	(req, res) => {
		db.getVolunteersByCountry(req.params.country)
			.then((r) => res.status(200).json(r))
			.catch((e) => res.status(500).json(e.message));
	}
);

module.exports = router;
