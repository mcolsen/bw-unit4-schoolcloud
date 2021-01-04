exports.seed = function (knex) {
	return knex("tasks").insert([
		{
			name: "Fake Task 1",
			description: "This is a fake task used for testing the API and database",
			uuid: "c886fd46-54d6-4d53-9889-37c23d3f8531",
		},
		{
			name: "Fake Task 2",
			uuid: "fdb82bec-89c8-442e-8172-dd2dd7368f3e",
		},
		{
			name: "Fake Task 3",
			uuid: "6f333d74-d37d-407d-af30-f138323b5c29",
		},
	]);
};
