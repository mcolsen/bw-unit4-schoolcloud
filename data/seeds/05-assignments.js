exports.seed = function (knex) {
	return knex("assignments").insert([
		{
			volunteer: "73f6dac4-ca13-4d80-a845-63a1c55c40e9",
			task: "c886fd46-54d6-4d53-9889-37c23d3f8531",
			complete: true,
		},
		{
			volunteer: "73f6dac4-ca13-4d80-a845-63a1c55c40e9",
			task: "fdb82bec-89c8-442e-8172-dd2dd7368f3e",
			complete: false,
		},
	]);
};
