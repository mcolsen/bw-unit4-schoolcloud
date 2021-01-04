const joi = require("joi");

const newTask = (req, res, next) => {
	const schema = joi.object({
		name: joi.string().max(255).required(),
		description: joi.string().max(1000),
	});

	const { error } = schema.validate(req.body);

	if (error) {
		res.status(400).json(error.details[0]);
	} else {
		next();
	}
};

//	Attaches task data to req object as req.task
const taskUUID = (req, res, next) => {
	const schema = joi.string().uuid({ version: "uuidv4" });

	const { error } = schema.validate(req.params.uuid);

	if (error) {
		res.status(400).json(error.details[0]);
	} else {
		const { getTask } = require("./model");

		getTask(req.params.uuid).then((r) => {
			if (r.length === 0) {
				res.status(404).end();
			} else if (r.length === 1) {
				req.task = r[0];
				next();
			} else {
				res.status(500).end();
			}
		});
	}
};

const updateTask = (req, res, next) => {
	const schema = joi
		.object({
			name: joi.string().max(255),
			description: joi.string().max(1000),
		})
		.or("name", "description");

	const { error } = schema.validate(req.body);

	if (error) {
		res.status(400).json(error.details[0]);
	} else {
		next();
	}
};

const assignments = (req, res, next) => {
	const schema = joi
		.object({
			assign: joi
				.array()
				.items(joi.string().uuid({ version: "uuidv4" }))
				.min(1),
			unassign: joi
				.array()
				.items(joi.string().uuid({ version: "uuidv4" }))
				.min(1),
		})
		.or("assign", "unassign");

	const { error } = schema.validate(req.body);

	if (error) {
		res.status(400).json(error.details[0]);
	} else {
		const { getAllVolunteers } = require("../users/model");
		getAllVolunteers().then((r) => {
			const allVols = r.map((vol) => vol.uuid);

			//	Validate that all un/assign UUIDs belong to existing volunteers
			let volMatchError = [];
			if (req.body.assign) {
				req.body.assign.forEach((uuid) => {
					if (!allVols.find((volUUID) => volUUID === uuid)) {
						volMatchError = [
							...volMatchError,
							`${uuid} does not belong to any existing volunteers`,
						];
					}
				});
			}
			if (req.body.unassign) {
				req.body.unassign.forEach((uuid) => {
					if (!allVols.find((volUUID) => volUUID === uuid)) {
						volMatchError = [
							...volMatchError,
							`${uuid} does not belong to any existing volunteers`,
						];
					}
				});
			}

			if (volMatchError.length === 0) {
				const { getTaskAssignments } = require("./model");
				getTaskAssignments(req.task.uuid).then((r) => {
					const assignedVols = r.map((a) => a.volunteer);

					//	Validate that no assign UUIDs and all unassign UUIDs appear in assignedVols
					let comparisonError = [];
					if (req.body.assign) {
						req.body.assign.forEach((uuid) => {
							if (assignedVols.find((volUUID) => volUUID === uuid)) {
								comparisonError = [
									...comparisonError,
									`${uuid} is already assigned to this task`,
								];
							}
						});
					} else {
						req.body.assign = [];
					}
					if (req.body.unassign) {
						req.body.unassign.forEach((uuid) => {
							if (!assignedVols.find((volUUID) => volUUID === uuid)) {
								comparisonError = [
									...comparisonError,
									`${uuid} is not assigned to this task`,
								];
							}
						});
					} else {
						req.body.unassign = [];
					}

					if (comparisonError.length === 0) {
						next();
					} else if (comparisonError.length === 1) {
						res.status(400).json({ message: comparisonError[0] });
					} else {
						res.status(400).json({ message: comparisonError });
					}
				});
			} else if (volMatchError.length === 1) {
				res.status(400).json({ message: volMatchError[0] });
			} else {
				res.status(400).json({ message: volMatchError });
			}
		});
	}
};

const taskStatus = (req, res, next) => {
	const schema = joi.object({
		complete: joi.boolean().required(),
	});

	const { error } = schema.validate(req.body);

	if (error) {
		res.status(400).json(error.details[0]);
	} else {
		const { verifyUserAssignment } = require("./model");

		verifyUserAssignment(req.decoded.subject, req.task.uuid)
			.then((r) => {
				if (r.length === 1) {
					if (r[0].complete === req.body.complete) {
						res.status(400).json({
							message: `Task status is already ${
								r[0].complete ? "" : "in"
							}complete`,
						});
					} else {
						next();
					}
				} else if (r.length === 0) {
					res.status(403).json({
						message: `Task not assigned to ${req.decoded.subject}`,
					});
				}
			})
			.catch((e) => res.status(500).json(e.message));
	}
};

module.exports = { newTask, taskUUID, updateTask, assignments, taskStatus };
