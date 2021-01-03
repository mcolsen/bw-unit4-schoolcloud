exports.seed = function (knex) {
	return knex("roles").insert([
		{ name: "admin" },
		{ name: "student" },
		{ name: "volunteer" },
	]);
};
