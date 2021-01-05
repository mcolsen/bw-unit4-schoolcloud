//  Heroku database connection for production
const pgConnection = `${process.env.DATABASE_URL}?ssl=true`;

module.exports = {
	development: {
		client: "sqlite3",
		useNullAsDefault: true,
		connection: {
			filename: "./data/dev.sqlite3",
		},
		migrations: {
			directory: "./data/migrations",
		},
		seeds: {
			directory: "./data/seeds-dev",
		},
	},
	production: {
		client: "pg",
		version: "7.18.2",
		useNullAsDefault: true,
		connection: pgConnection,
		pool: {
			min: 2,
			max: 10,
		},
		migrations: {
			directory: "./data/migrations",
			tableName: "knex_migrations",
		},
		seeds: {
			directory: "./data/seeds-prod",
		},
	},
};
