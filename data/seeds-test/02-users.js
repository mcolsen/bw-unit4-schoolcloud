require("dotenv").config();
const bcrypt = require("bcryptjs");

const bcryptRounds = Number(process.env.BCRYPT_ROUNDS);

exports.seed = function (knex) {
	return knex("users").insert([
		{
			role: "admin",
			username: "admin",
			password: bcrypt.hashSync("password", bcryptRounds),
			uuid: "bb16b555-270c-4cc4-9c18-f9d3a5804f82",
			country: "US",
		},
		{
			role: "student",
			username: "student",
			password: bcrypt.hashSync("password", bcryptRounds),
			uuid: "dbc0d6aa-abb3-4cc2-be68-e956e7bfb6c8",
			country: "US",
		},
		{
			role: "volunteer",
			username: "volunteer",
			password: bcrypt.hashSync("password", bcryptRounds),
			uuid: "73f6dac4-ca13-4d80-a845-63a1c55c40e9",
			country: "US",
		},
	]);
};
