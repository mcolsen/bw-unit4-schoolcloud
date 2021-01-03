const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const authRouter = require("./auth/router");
const userRouter = require("./users/router");
const tasksRouter = require("./tasks/router");
const scheduleRouter = require("./schedule/router");

const server = express();

server.use(helmet());
server.use(express.json());
server.use(
	cors({
		origin:
			process.env.NODE_ENV === "production"
				? "*" /* Add frontend url here when deployed */
				: "*",
	})
);

server.use("/api/auth", authRouter);
server.use("/api/users", userRouter);
server.use("/api/tasks", tasksRouter);
server.use("/api/schedule", scheduleRouter);

server.use("*", (req, res) => {
	res.status(404).end();
});

module.exports = server;
