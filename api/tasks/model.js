const connect = require("../../data/connection");
const { getUserUUID } = require("../schedule/model");

//	Assignment completion boolean returns from the database represented
//	as 0 (false) or 1 (true), which is not the intended format
const convertBool = (task) => ({
	...task,
	complete: task.complete ? true : false,
});

const getAllTasks = () => connect("tasks");

const getUserTasks = (username) =>
	getUserUUID(username).then((volUUID) =>
		connect("tasks")
			.join("assignments", "assignments.task", "tasks.uuid")
			.select("tasks.*", "assignments.complete")
			.where({ "assignments.volunteer": volUUID })
			.then((r) => r.map((task) => convertBool(task)))
	);

const getTaskAssignments = (taskUUID) =>
	connect("tasks")
		.join("assignments", "assignments.task", "tasks.uuid")
		.select("assignments.volunteer", "assignments.complete")
		.where({ "assignments.task": taskUUID })
		.then((r) => r.map((a) => convertBool(a)));

const addTask = (task) => {
	const { v4: uuid } = require("uuid");

	const taskUUID = uuid();

	return connect("tasks")
		.insert({ ...task, uuid: taskUUID })
		.then(() => connect("tasks").where({ uuid: taskUUID }));
};

const getTask = (uuid) => connect("tasks").where({ uuid: uuid });

const updateTask = (uuid, changes) =>
	connect("tasks")
		.where({ uuid: uuid })
		.update(changes)
		.then(() => getTask(uuid))
		.then((r) => r[0]);

const verifyUserAssignment = (username, taskUUID) =>
	getUserUUID(username)
		.then((volUUID) =>
			connect("assignments").where({ volunteer: volUUID, task: taskUUID })
		)
		.then((r) => r.map((a) => convertBool(a)));

const updateAssignmentStatus = (username, taskUUID, complete) =>
	getUserUUID(username).then((volUUID) =>
		connect("assignments")
			.where({ volunteer: volUUID, task: taskUUID })
			.update({ complete: complete })
			.then(() =>
				getTask(taskUUID).then((r) => ({ ...r[0], complete: complete }))
			)
	);

const updateTaskAssignments = (taskUUID, reqbody) => {
	const { assign, unassign } = reqbody;

	//	Create an array of promises for both arrays
	const unassignPromises = unassign.map((volUUID) =>
		connect("assignments").where({ volunteer: volUUID, task: taskUUID }).del()
	);
	const assignPromises = assign.map((volUUID) =>
		connect("assignments").insert({
			volunteer: volUUID,
			task: taskUUID,
			complete: false,
		})
	);

	return Promise.all(unassignPromises)
		.then(() => Promise.all(assignPromises))
		.then(() => getTaskAssignments(taskUUID));
};

const deleteTask = (taskUUID) =>
	connect("tasks").where({ uuid: taskUUID }).del();

module.exports = {
	getAllTasks,
	getUserTasks,
	addTask,
	getTask,
	updateTask,
	getTaskAssignments,
	verifyUserAssignment,
	updateAssignmentStatus,
	updateTaskAssignments,
	deleteTask,
};
