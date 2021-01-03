const connect = require("../../data/connection");

const getAllUsers = () => connect("users");

module.exports = { getAllUsers };
