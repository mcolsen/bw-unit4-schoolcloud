const { DateTime, Interval } = require("luxon");

exports.seed = function (knex) {
	return knex("schedule").insert([
		{
			interval: Interval.fromDateTimes(
				DateTime.fromObject({
					year: 2021,
					month: 1,
					day: 1,
					hour: 12,
					minute: 1,
				}),
				DateTime.fromObject({
					year: 2021,
					month: 1,
					day: 1,
					hour: 18,
					minute: 30,
				})
			).toISO(),
			uuid: "1e9a7d2d-4920-442d-bf82-f7edb4216c6c",
			volunteer: "73f6dac4-ca13-4d80-a845-63a1c55c40e9",
		},
		{
			interval: Interval.fromDateTimes(
				DateTime.fromObject({
					year: 2021,
					month: 1,
					day: 2,
					hour: 8,
				}),
				DateTime.fromObject({
					year: 2021,
					month: 1,
					day: 2,
					hour: 12,
					minute: 30,
				})
			).toISO(),
			uuid: "b8b7841e-ac27-4501-98be-cafd98ae06c7",
			volunteer: "73f6dac4-ca13-4d80-a845-63a1c55c40e9",
			student: "dbc0d6aa-abb3-4cc2-be68-e956e7bfb6c8",
		},
	]);
};
