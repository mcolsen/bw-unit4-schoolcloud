const connect = require("../../data/connection");

const getAllUsers = () =>
	connect("users").select("uuid", "username", "role", "country");

const getAllVolunteers = () =>
	connect("users")
		.where({ role: "volunteer" })
		.select("uuid", "username", "role", "country");

const getVolunteersByCountry = (country) =>
	connect("users")
		.where({ role: "volunteer", country: country })
		.select("uuid", "username", "role", "country");

module.exports = { getAllUsers, getAllVolunteers, getVolunteersByCountry };
