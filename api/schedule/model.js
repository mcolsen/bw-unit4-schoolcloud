const connect = require("../../data/connection");

//	Helper functions
const mergeSlots = (schedule) => {
	//	Merge open slots on a single volunteer's schedule
	const { Interval } = require("luxon");
	const { v4: uuid } = require("uuid");

	const intervals = schedule
		.filter((slot) => !slot.student)
		.map((slot) => Interval.fromISO(slot.interval));
	const merged = Interval.merge(intervals);

	let insert = [];
	merged.forEach((m) => {
		if (!intervals.find((i) => i.equals(m))) {
			insert.push({
				uuid: uuid(),
				interval: m.toISO(),
				volunteer: schedule[0].volunteer,
			});
		}
	});

	let remove = [];
	intervals.forEach((i) => {
		if (!merged.find((m) => m.equals(i))) {
			schedule.forEach((slot) => {
				if (i.equals(Interval.fromISO(slot.interval))) {
					remove.push(slot.uuid);
				}
			});
		}
	});

	let promises = [];
	insert.forEach((i) => {
		promises.push(connect("schedule").insert(i));
	});
	remove.forEach((r) => {
		promises.push(connect("schedule").where({ uuid: r }).del());
	});
	return promises;
};

const getVolunteerSchedule = (volUuid) =>
	connect("schedule").where({ volunteer: volUuid });

//	Exported functions for router and middleware
const getUserUUID = (username) =>
	connect("users")
		.select("uuid")
		.where({ username: username })
		.then((r) => r[0].uuid);

const getAllSlots = () => connect("schedule");

const addSlot = (slot) => {
	const { v4: uuid } = require("uuid");

	return connect("schedule")
		.insert({ ...slot, interval: slot.interval.toISO(), uuid: uuid() })
		.then(() => {
			return getVolunteerSchedule(slot.volunteer).then((schedule) => {
				return Promise.all(mergeSlots(schedule)).then(() =>
					getVolunteerSchedule(slot.volunteer)
				);
			});
		});
};

const getSlot = (uuid) => connect("schedule").where({ uuid: uuid });

const deleteSlot = (uuid) => connect("schedule").where({ uuid: uuid }).del();

module.exports = {
	getUserUUID,
	getAllSlots,
	getSlot,
	addSlot,
	deleteSlot,
};
