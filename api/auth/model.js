const connect = require("../../data/connection");

const addUser = (user) => connect("users").insert(user);

const getUserWithPassword = (username) =>
	connect("users").where({ username: username });

module.exports = { addUser, getUserWithPassword };
