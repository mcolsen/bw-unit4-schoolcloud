require("dotenv").config;
const supertest = require("supertest");
const api = require("../../api/server");
const knex = require("../../data/connection");
const jwt = require("jsonwebtoken");

const server = supertest(api);

const basePath = "/api/auth";

beforeAll(async () => {
	await knex.migrate.rollback();
	await knex.migrate.latest();
});

beforeEach(async () => {
	await knex.seed.run();
});

afterAll(async () => {
	await knex.destroy();
});

describe("POST /register", () => {
	const path = `${basePath}/register`;

	describe("Request data validation", () => {
		it("Rejects requests with invalid user role", async () => {
			const res = await server
				.post(path)
				.send({ username: "username", password: "password", role: "coder" });

			expect(res.status).toEqual(400);
		});

		it("Rejects request with invalid country code", async () => {
			const res = await server.post(path).send({
				username: "username",
				password: "password",
				role: "volunteer",
				country: "UK",
			});

			expect(res.status).toEqual(400);
		});

		describe("Rejects requests missing required data", () => {
			it("Missing role", async () => {
				const res = await server.post(path).send({
					username: "username",
					password: "password",
				});

				expect(res.status).toEqual(400);
			});

			it("Missing username", async () => {
				const res = await server.post(path).send({
					password: "password",
					role: "admin",
				});

				expect(res.status).toEqual(400);
			});

			it("Missing password", async () => {
				const res = await server.post(path).send({
					username: "username",
					role: "admin",
				});

				expect(res.status).toEqual(400);
			});

			it("Missing country (when registering as volunteer)", async () => {
				const res = await server.post(path).send({
					username: "username",
					password: "password",
					role: "volunteer",
				});

				expect(res.status).toEqual(400);
			});
		});

		it("Rejects requests with extra data", async () => {
			const res = await server.post(path).send({
				username: "username",
				password: "password",
				role: "volunteer",
				state: "UT",
			});

			expect(res.status).toEqual(400);
		});

		describe("Rejects requests with incorrect data types", () => {
			it("Array", async () => {
				const res1 = await server.post(path).send({
					username: ["username"],
					password: "password",
					role: "volunteer",
					country: "US",
				});
				const res2 = await server.post(path).send({
					username: "username",
					password: ["password"],
					role: "volunteer",
					country: "US",
				});
				const res3 = await server.post(path).send({
					username: "username",
					password: "password",
					role: ["volunteer"],
					country: "US",
				});
				const res4 = await server.post(path).send({
					username: "username",
					password: "password",
					role: "volunteer",
					country: ["US"],
				});
				const res5 = await server.post(path).send({
					username: ["username"],
					password: ["password"],
					role: ["volunteer"],
					country: ["US"],
				});

				expect(res1.status).toEqual(400);
				expect(res2.status).toEqual(400);
				expect(res3.status).toEqual(400);
				expect(res4.status).toEqual(400);
				expect(res5.status).toEqual(400);
			});

			it("Boolean", async () => {
				const res1 = await server.post(path).send({
					username: true,
					password: "password",
					role: "volunteer",
					country: "US",
				});
				const res2 = await server.post(path).send({
					username: "username",
					password: true,
					role: "volunteer",
					country: "US",
				});
				const res3 = await server.post(path).send({
					username: "username",
					password: "password",
					role: true,
					country: "US",
				});
				const res4 = await server.post(path).send({
					username: "username",
					password: "password",
					role: "volunteer",
					country: true,
				});
				const res5 = await server.post(path).send({
					username: false,
					password: false,
					role: false,
					country: false,
				});

				expect(res1.status).toEqual(400);
				expect(res2.status).toEqual(400);
				expect(res3.status).toEqual(400);
				expect(res4.status).toEqual(400);
				expect(res5.status).toEqual(400);
			});

			it("Number", async () => {
				const res1 = await server.post(path).send({
					username: 1,
					password: "password",
					role: "volunteer",
					country: "US",
				});
				const res2 = await server.post(path).send({
					username: "username",
					password: 2,
					role: "volunteer",
					country: "US",
				});
				const res3 = await server.post(path).send({
					username: "username",
					password: "password",
					role: 3,
					country: "US",
				});
				const res4 = await server.post(path).send({
					username: "username",
					password: "password",
					role: "admin",
					country: 4,
				});
				const res5 = await server.post(path).send({
					username: 5,
					password: 6,
					role: 7,
					country: 8,
				});

				expect(res1.status).toEqual(400);
				expect(res2.status).toEqual(400);
				expect(res3.status).toEqual(400);
				expect(res4.status).toEqual(400);
				expect(res5.status).toEqual(400);
			});

			it("Object", async () => {
				const res1 = await server.post(path).send({
					username: { username: "username" },
					password: "password",
					role: "volunteer",
					country: "US",
				});
				const res2 = await server.post(path).send({
					username: "username",
					password: { password: "password" },
					role: "volunteer",
					country: "US",
				});
				const res3 = await server.post(path).send({
					username: "username",
					password: "password",
					role: { role: "volunteer" },
					country: "US",
				});
				const res4 = await server.post(path).send({
					username: "username",
					password: "password",
					role: "volunteer",
					country: { country: "US" },
				});
				const res5 = await server.post(path).send({
					username: { username: "username" },
					password: { password: "password" },
					role: { role: "volunteer" },
					country: { country: "US" },
				});

				expect(res1.status).toEqual(400);
				expect(res2.status).toEqual(400);
				expect(res3.status).toEqual(400);
				expect(res4.status).toEqual(400);
				expect(res5.status).toEqual(400);
			});
		});
	});

	describe("Valid requests", () => {
		const cred = {
			username: "jestUser",
			password: "password",
			country: "US",
		};

		it("Register new admin", async (done) => {
			const res = await server.post(path).send({ ...cred, role: "admin" });

			expect(res.status).toEqual(201);
			expect(res.body).toHaveProperty("message", "Welcome jestUser");
			expect(res.body).toHaveProperty("token");
			expect(res.body.token).toEqual(expect.any(String));

			jwt.verify(res.body.token, process.env.JWT_SECRET, (err, decoded) => {
				expect(err).toBeFalsy();
				expect(decoded).toHaveProperty("subject", cred.username);
				expect(decoded).toHaveProperty("role");
			});

			done();
		});

		it("Register new volunteer", async (done) => {
			const res = await server.post(path).send({ ...cred, role: "volunteer" });

			expect(res.status).toEqual(201);
			expect(res.body).toHaveProperty("message", "Welcome jestUser");
			expect(res.body).toHaveProperty("token");
			expect(res.body.token).toEqual(expect.any(String));

			jwt.verify(res.body.token, process.env.JWT_SECRET, (err, decoded) => {
				expect(err).toBeFalsy();
				expect(decoded).toHaveProperty("subject", cred.username);
				expect(decoded).toHaveProperty("role");
			});

			done();
		});

		it("Register new student", async (done) => {
			const res = await server.post(path).send({ ...cred, role: "student" });

			expect(res.status).toEqual(201);
			expect(res.body).toHaveProperty("message", "Welcome jestUser");
			expect(res.body).toHaveProperty("token");
			expect(res.body.token).toEqual(expect.any(String));

			jwt.verify(res.body.token, process.env.JWT_SECRET, (err, decoded) => {
				expect(err).toBeFalsy();
				expect(decoded).toHaveProperty("subject", cred.username);
				expect(decoded).toHaveProperty("role");
			});

			done();
		});
	});
});

describe("POST /login", () => {
	const path = `${basePath}/login`;

	const username = "admin";
	const password = "password";

	describe("Request data validation", () => {
		it("Rejects requests missing required data", async () => {
			const noUsernameRes = await server.post(path).send({
				password: password,
			});
			const noPasswordRes = await server.post(path).send({
				password: password,
			});
			const neitherRes = await server.post(path).send({
				password: password,
			});

			expect(noUsernameRes.status).toEqual(400);
			expect(noPasswordRes.status).toEqual(400);
			expect(neitherRes.status).toEqual(400);
		});

		it("Rejects requests with extra data", async () => {
			const res = await server.post(path).send({
				username: username,
				password: password,
				role: "admin",
			});

			expect(res.status).toEqual(400);
		});

		describe("Rejects requests with incorrect data types", () => {
			it("Array", async () => {
				const res1 = await server.post(path).send({
					username: [username],
					password: password,
				});
				const res2 = await server.post(path).send({
					username: username,
					password: [password],
				});
				const res3 = await server.post(path).send({
					username: [username],
					password: [password],
				});

				expect(res1.status).toEqual(400);
				expect(res2.status).toEqual(400);
				expect(res3.status).toEqual(400);
			});

			it("Boolean", async () => {
				const res1 = await server.post(path).send({
					username: true,
					password: password,
				});
				const res2 = await server.post(path).send({
					username: username,
					password: true,
				});
				const res3 = await server.post(path).send({
					username: false,
					password: false,
				});

				expect(res1.status).toEqual(400);
				expect(res2.status).toEqual(400);
				expect(res3.status).toEqual(400);
			});

			it("Number", async () => {
				const res1 = await server.post(path).send({
					username: 12,
					password: password,
				});
				const res2 = await server.post(path).send({
					username: username,
					password: 34,
				});
				const res3 = await server.post(path).send({
					username: 56,
					password: 78,
				});

				expect(res1.status).toEqual(400);
				expect(res2.status).toEqual(400);
				expect(res3.status).toEqual(400);
			});

			it("Object", async () => {
				const res1 = await server.post(path).send({
					username: { username },
					password: password,
				});
				const res2 = await server.post(path).send({
					username: username,
					password: { password },
				});
				const res3 = await server.post(path).send({
					username: { username },
					password: { password },
				});

				expect(res1.status).toEqual(400);
				expect(res2.status).toEqual(400);
				expect(res3.status).toEqual(400);
			});
		});
	});

	describe("Valid requests", () => {
		describe("Invalid credentials", () => {
			it("Rejects invalid username", async () => {
				const res = await server.post(path).send({
					username: "invalid",
					password: password,
				});

				expect(res.status).toEqual(401);
				expect(res.body).toEqual("Invalid credentials");
			});

			it("Rejects invalid password", async () => {
				const res = await server.post(path).send({
					username: username,
					password: "invalid",
				});

				expect(res.status).toEqual(401);
				expect(res.body).toEqual("Invalid credentials");
			});
		});

		describe("Valid credentials", () => {
			it("Returns valid token and welcome message", async (done) => {
				const res = await server
					.post(path)
					.send({ username: username, password: password });

				expect(res.status).toBe(200);
				expect(res.body.message).toEqual(`Welcome ${username}`);
				expect(res.body.token).toEqual(expect.any(String));

				jwt.verify(res.body.token, process.env.JWT_SECRET, (err, decoded) => {
					expect(err).toBeFalsy();
					expect(decoded).toHaveProperty("subject", username);
					expect(decoded).toHaveProperty("role");
				});

				done();
			});
		});
	});
});
