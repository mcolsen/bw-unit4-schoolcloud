const jwt = require("jsonwebtoken");

const defaultRoles = ["admin", "student", "volunteer"];

//	Returns middleware that validates tokens and restricts access using specified user roles. A single role may be specified as a string. Multiple roles may be specified as an array of strings. If all roles may access the endpoint, no parameter is necessary.
module.exports = (roles = defaultRoles) => {
	if (!Array.isArray(roles)) {
		if (typeof roles === "string") {
			roles = [roles];
		} else {
			roles = defaultRoles;
		}
	}

	return (req, res, next) => {
		const token = req.headers.authorization;

		if (token) {
			const secret = process.env.JWT_SECRET;

			jwt.verify(token, secret, (err, decoded) => {
				if (err) {
					res.status(401).json("invalid token");
				} else {
					if (roles.find((role) => role === decoded.role)) {
						req.decoded = decoded;
						next();
					} else {
						res
							.status(403)
							.json(
								`${decoded.subject} is forbidden from accessing this resource`
							);
					}
				}
			});
		} else {
			res.status(401).json("Token must be specified in authorization header");
		}
	};
};
