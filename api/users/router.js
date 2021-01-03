const express = require("express");
const { getAllUsers } = require("./model");

const router = express.Router();

router.get("/", (req, res) => {
	getAllUsers()
		.then((r) => res.status(200).json(r))
		.catch((e) => res.status(500).json(e.message));
});

module.exports = router;
