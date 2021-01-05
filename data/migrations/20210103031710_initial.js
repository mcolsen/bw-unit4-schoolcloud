exports.up = function (knex) {
	return knex.schema
		.createTable("roles", (t) => {
			t.string("name").notNullable().primary();
		})
		.createTable("users", (t) => {
			t.uuid("uuid").notNullable().unique().primary();
			t.string("username").notNullable().unique();
			t.string("password").notNullable();
			t.string("role")
				.notNullable()
				.references("name")
				.inTable("roles")
				.onUpdate("CASCADE")
				.onDelete("CASCADE");
			t.string("country");
		})
		.createTable("schedule", (t) => {
			t.uuid("uuid").notNullable().unique().primary();
			t.string("interval").notNullable();
			t.uuid("volunteer")
				.notNullable()
				.references("uuid")
				.inTable("users")
				.onUpdate("CASCADE")
				.onDelete("CASCADE");
			t.uuid("student")
				.references("uuid")
				.inTable("users")
				.onUpdate("CASCADE")
				.onDelete("CASCADE");
		})
		.createTable("tasks", (t) => {
			t.uuid("uuid").notNullable().unique().primary();
			t.string("name").notNullable();
			t.string("description", 1000);
		})
		.createTable("assignments", (t) => {
			t.uuid("volunteer")
				.notNullable()
				.references("uuid")
				.inTable("users")
				.onUpdate("CASCADE")
				.onDelete("CASCADE");
			t.uuid("task")
				.notNullable()
				.references("uuid")
				.inTable("tasks")
				.onUpdate("CASCADE")
				.onDelete("CASCADE");
			t.boolean("complete").notNullable().defaultTo(false);
			t.primary(["volunteer", "task"]);
			t.unique(["volunteer", "task"]);
		});
};

exports.down = function (knex) {
	return knex.schema
		.dropTableIfExists("assignments")
		.dropTableIfExists("tasks")
		.dropTableIfExists("schedule")
		.dropTableIfExists("users")
		.dropTableIfExists("roles");
};
