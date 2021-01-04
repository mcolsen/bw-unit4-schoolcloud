const express = require("express");
const reserveRouter = require("./reserve/router");
const restrict = require("../middlewares/restrict");
const validate = require("./validation");
const db = require("./model");

const router = express.Router();

router.use("/reserve", reserveRouter);

router.get("/", restrict(), (req, res) => {
	db.getAllSlots()
		.then((r) => res.status(200).json(r))
		.catch((e) => res.status(500).json(e.message));
});

router.post("/", restrict("volunteer"), validate.newSlot, (req, res) => {
	db.addSlot(req.body)
		.then((r) => res.status(201).json(r))
		.catch((e) => res.json(500).json(e.message));
});

router.delete("/:uuid", restrict("volunteer"), (req, res) => {
	db.getSlot(req.params.uuid)
		.then((r) => {
			if (r.length === 1) {
				const slot = r[0];

				db.getUserUUID(req.decoded.subject)
					.then((volUUID) => {
						if (slot.volunteer === volUUID) {
							db.deleteSlot(req.params.uuid)
								.then(() => res.status(200).json(slot))
								.catch((e) => res.status(500).json(e.message));
						} else {
							res
								.status(403)
								.json(
									`${req.decoded.subject} is not assigned to this time slot`
								);
						}
					})
					.catch((e) => res.status(500).json(e.message));
			} else if (r.length === 0) {
				res.status(404).end();
			} else {
				res.status(500).end();
			}
		})
		.catch((e) => res.status(500).json(e.message));
});

module.exports = router;
