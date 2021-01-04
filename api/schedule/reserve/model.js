const connect = require("../../../data/connection");

const { getSlot, getUserUUID } = require("../model");

const getStudentSchedule = (username) =>
	getUserUUID(username).then((studUUID) =>
		connect("schedule").where({ student: studUUID })
	);

const reserveSlot = (uuid, studUUID) =>
	connect("schedule").where({ uuid: uuid }).update({ student: studUUID });

const divideSlot = (slot, subIntvl, studUUID) => {
	const { Interval } = require("luxon");
	const { v4: uuid } = require("uuid");
	const volUUID = slot.volunteer;

	//	Array of promises, initialized containing a promise to delete the old interval
	let promises = [connect("schedule").where({ uuid: slot.uuid }).del()];

	//	Create promises to insert the new intervals that the student has not reserved
	Interval.xor([subIntvl, Interval.fromISO(slot.interval)]).forEach((intvl) => {
		promises.push(
			connect("schedule").insert({
				uuid: uuid(),
				interval: intvl.toISO(),
				volunteer: volUUID,
			})
		);
	});

	//	Push promise to insert new interval reserved by student
	const resUUID = uuid();
	promises.push(
		connect("schedule").insert({
			uuid: resUUID,
			interval: subIntvl.intersection(Interval.fromISO(slot.interval)).toISO(),
			volunteer: volUUID,
			student: studUUID,
		})
	);

	//Execute promises and return new reservation slot
	return Promise.all(promises).then(() => getSlot(resUUID).then((r) => r[0]));
};

//	Merge open slots and those assigned to the current student across multiple volunteers
const mergeSlots = (studUUID) => {
	//	Get all time slots assigned to student and those unassigned to a student,
	return connect("schedule")
		.where({ student: studUUID })
		.orWhere({ student: null })
		.then((slots) => {
			const { Interval } = require("luxon");
			const { v4: uuid } = require("uuid");

			//	Create an array of objects, one for each volunteer represented in the original data
			//	Each object contains the volunteer UUID, an array of open slots, and an array or reserved slots
			const sorted = [...new Set(slots.map((slot) => slot.volunteer))].map(
				(volUUID) => {
					const volSlots = slots.filter((slot) => slot.volunteer === volUUID);

					return {
						volunteer: volUUID,
						openIntvls: volSlots
							.filter((slot) => !slot.student)
							.map((slot) => Interval.fromISO(slot.interval)),
						reservedIntvls: volSlots
							.filter((slot) => slot.student === studUUID)
							.map((slot) => Interval.fromISO(slot.interval)),
					};
				}
			);

			//	Create an array with merged intervals for comparison
			const merged = sorted.map((v) => ({
				...v,
				openIntvls: Interval.merge(v.openIntvls),
				reservedIntvls: Interval.merge(v.reservedIntvls),
			}));

			//	Compare merged and original arrays =
			//	Intervals in merged but not sorted need to be inserted to the database
			//	Conversely, Intervals in sorted but not merged need to be deleted
			let promises = [];

			merged.forEach((m) => {
				const s = sorted.find((v) => v.volunteer === m.volunteer);

				//	Compare each item in both sets of openIntvls arrays and creating promise to insert
				//	slot objects representing the new intervals found only in the merged arrays
				m.openIntvls.forEach((mIntvl) => {
					if (!s.openIntvls.find((sIntvl) => mIntvl.equals(sIntvl))) {
						promises.push(
							connect("schedule").insert({
								uuid: uuid(),
								interval: mIntvl.toISO(),
								volunteer: m.volunteer,
							})
						);
					}
				});
				//	And the same for the reservedIntvls arrays
				m.reservedIntvls.forEach((mIntvl) => {
					if (!s.reservedIntvls.find((sIntvl) => mIntvl.equals(sIntvl))) {
						promises.push(
							connect("schedule").insert({
								uuid: uuid(),
								interval: mIntvl.toISO(),
								volunteer: m.volunteer,
								student: studUUID,
							})
						);
					}
				});

				//	And the opposite for intervals not found in the merged arrays
				s.openIntvls.forEach((sIntvl) => {
					if (!m.openIntvls.find((mIntvl) => sIntvl.equals(mIntvl))) {
						//	Query original slots array to find cooresponding UUID
						const { uuid } = slots.find((slot) =>
							sIntvl.equals(Interval.fromISO(slot.interval))
						);
						promises.push(connect("schedule").where({ uuid: uuid }).del());
					}
				});
				s.reservedIntvls.forEach((sIntvl) => {
					if (!m.reservedIntvls.find((mIntvl) => sIntvl.equals(mIntvl))) {
						//	Query original slots array to find cooresponding UUID
						const { uuid } = slots.find((slot) =>
							sIntvl.equals(Interval.fromISO(slot.interval))
						);
						promises.push(connect("schedule").where({ uuid: uuid }).del());
					}
				});
			});

			return Promise.all(promises);
		});
};

const unreserveSlot = (uuid) =>
	connect("schedule").where({ uuid: uuid }).update({ student: null });

module.exports = {
	getSlot,
	getUserUUID,
	getStudentSchedule,
	reserveSlot,
	divideSlot,
	unreserveSlot,
	mergeSlots,
};
