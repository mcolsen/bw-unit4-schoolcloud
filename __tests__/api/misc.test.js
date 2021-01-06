const supertest = require("supertest");
const api = require("../../api/server");

const server = supertest(api);

describe("404", () => {
	it("/", async (done) => {
		const res = await server.get("/");
		expect(res.status).toBe(404);

		done();
	});
});
