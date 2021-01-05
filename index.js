require("dotenv").config();
const server = require("./api/server");

const port = process.env.PORT || 5000;

console.log(process.env.NODE_ENV);
console.log(process.env.JWT_SECRET);

server.listen(port, () =>
	console.log(`\n* Server listening on port ${port} *`)
);
