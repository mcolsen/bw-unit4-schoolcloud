const express = require("express");
const restrict = require("../middlewares/restrict");
const validate = require("./validation");
const db = require("./model");

const router = express.Router();

router.get("/", restrict(["admin", "volunteer"]), (req, res) => {
	const { role } = req.decoded;

	if (role === "admin") {
		db.getAllTasks()
			.then((r) => res.status(200).json(r))
			.catch((e) => res.status(500).json(e.message));
	} else if (role === "volunteer") {
		db.getUserTasks(req.decoded.subject)
			.then((r) => res.status(200).json(r))
			.catch((e) => res.status(500).json(e.message));
	} else {
		res.status(500).end();
	}
});

router.get("/:uuid", restrict("admin"), validate.taskUUID, (req, res) => {
	db.getTaskAssignments(req.task.uuid)
		.then((r) => res.status(200).json({ ...req.task, assignments: r }))
		.catch((e) => res.status(500).json(e.message));
});

router.post("/", restrict("admin"), validate.newTask, (req, res) => {
	db.addTask(req.body)
		.then((r) => res.status(201).json(r))
		.catch((e) => res.status(500).json(e.message));
});

router.put(
	"/:uuid",
	restrict("admin"),
	validate.taskUUID,
	validate.updateTask,
	(req, res) => {
		db.updateTask(req.params.uuid, req.body)
			.then((r) => res.status(200).json(r))
			.catch((e) => res.status(500).json(e.message));
	}
);

router.delete("/:uuid", restrict("admin"), validate.taskUUID, (req, res) => {
	db.deleteTask(req.task.uuid)
		.then(() => res.status(200).json(req.task))
		.catch((e) => res.status(500).json(e.message));
});

router.post(
	"/:uuid/assign",
	restrict("admin"),
	validate.taskUUID,
	validate.assignments,
	(req, res) => {
		db.updateTaskAssignments(req.task.uuid, req.body)
			.then((r) => res.status(200).json({ ...req.task, assignments: r }))
			.catch((e) => res.status(500).json(e.message));
	}
);

router.post(
	"/:uuid/status",
	restrict("volunteer"),
	validate.taskUUID,
	validate.taskStatus,
	(req, res) => {
		db.updateAssignmentStatus(
			req.decoded.subject,
			req.task.uuid,
			req.body.complete
		)
			.then((r) => res.status(200).json(r))
			.catch((e) => res.status(500).json(e.message));
	}
);

module.exports = router;
