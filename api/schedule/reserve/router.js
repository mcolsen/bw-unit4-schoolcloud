const express = require("express");
const restrict = require("../../middlewares/restrict");
const db = require("./model");

const router = express.Router();

//	Get all reservations associated with student user
router.get("/", restrict("student"), (req, res) => {
	db.getStudentSchedule(req.decoded.subject)
		.then((r) => res.status(200).json(r))
		.catch((e) => res.status(500).json(e.message));
});

//	Reserve new slot. If interval is specified, student reserves only a portion of the instructor's slot. Defaults to entire slot
router.post("/:uuid", restrict("student"), (req, res) => {
	db.getSlot(req.params.uuid)
		.then((r) => {
			if (r.length === 1) {
				const slot = r[0];
				if (slot.student) {
					res
						.status(403)
						.json({ message: "This time slot is already reserved" });
				} else if (!req.body.interval) {
					db.getUserUUID(req.decoded.subject)
						.then((studUUID) =>
							db
								.reserveSlot(slot.uuid, studUUID)
								.then((r) => res.status(200).json(r))
								.catch((e) => res.status(500).json(e.message))
						)
						.catch((e) => res.status(500).json(e.message));
				} else {
					const { Interval } = require("luxon");
					const subIntvl = Interval.fromISO(req.body.interval);
					if (subIntvl.isValid) {
						const mainIntvl = Interval.fromISO(slot.interval);
						if (
							mainIntvl.engulfs(subIntvl) ||
							mainIntvl.abutsStart(subIntvl) ||
							mainIntvl.abutsEnd(subIntvl)
						) {
							db.getUserUUID(req.decoded.subject)
								.then((studUUID) => {
									db.divideSlot(slot, subIntvl, studUUID)
										.then((r) => res.status(201).json(r))
										.catch((e) => res.status(500).json(e.message));
								})
								.catch((e) => res.status(500).json(e.message));
						} else {
							res.status(400).json({
								message:
									"Interval specified in request body is not within this time slot",
							});
						}
					} else {
						res.status(400).json({ message: "Invalid ISO 8601 interval" });
					}
				}
			} else if (r.length === 0) {
				res.status(404).end();
			} else {
				res.status(500).end();
			}
		})
		.catch((e) => res.status(500).json(e.message));
});

//	Remove existing student reservation
router.delete("/:uuid", restrict("student"), (req, res) => {
	db.getSlot(req.params.uuid).then((r) => {
		if (r.length === 1) {
			const slot = r[0];

			db.getUserUUID(req.decoded.subject).then((studUUID) => {
				if (studUUID === slot.student) {
					db.unreserveSlot(slot.uuid)
						.then(() =>
							db
								.mergeSlots(studUUID)
								.then(() => res.status(200).json(slot))
								.catch((e) => res.status(500).json(e.message))
						)
						.catch((e) => res.status(500).json(e.message));
				} else {
					res
						.status(403)
						.json(`${req.decoded.subject} has not reserved this time slot`);
				}
			});
		} else if (r.length === 0) {
			res.status(404).end();
		} else {
			res.status(500).end();
		}
	});
});

module.exports = router;
