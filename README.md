# School Cloud Backend

## Notes for Frontend / Unit 3

### Deployed API URL

`https://bw-unit4-schoolcloud.herokuapp.com/`

### ISO interval format & country codes

The server requires that certain requests include data formatted in specific ways.

**[ISO 8601 intervals](https://en.wikipedia.org/wiki/ISO_8601#Time_intervals)**: All of the schedule endpoints either require or return data in this format. The backend utilizes [Luxon](https://moment.github.io/luxon/) to make it easy to work with time intervals and other date and time data. While I'm partial to Luxon, the backend is agnostic about how the frontend handles this data as long as it is properly formatted by the time a request is sent to the server, and there are [other solutions](https://momentjs.com/docs/#/-project-status/recommendations/) that may be worth looking at too.

**[ISO-3166-1 alpha-2 country codes](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)**: For endpoints that require it, country data must be formatted as an alpha-2 country code. A list of these codes, albeit without full country names, is included in this repository [here](https://github.com/mcolsen/bw-unit4-schoolcloud/blob/main/api/modules/country-codes.js).

### Running the server locally

If you would like to run the server locally for testing purposes, here are instructions:

1. Clone this repository and navigate to the directory
2. `echo "BCRYPT_ROUNDS=7\nJWT_SECRET=G0evoTTGYNp3RzfZb5DS7kXZnaqFPwjnEAVTWw4ue5nxAMt4Dc1ksw57QgPm" > .env`
   - Creates a .env to provide environment variables required by the server
   - The variables are largely arbitrary, as long as `BCRYPT_ROUNDS` is a positive integer and `JWT_SECRET` is a string
3. `yarn`
   - Install dependencies
4. `yarn run clean`
   - Initialize database and seed database
   - This can be used to reset the database to its initial state when needed
5. `yarn dev`
   - Start the server

## Endpoints

The server makes the following endpoints available to clients. Most require authentication using a JSON Web Token. A few allow requests from any user, but most are restricted to particular user roles. Authentication requirements, if any, for each endpoint are indicated in italics. If authentication is required but no user roles are listed, that endpoint is accessible to all users.

### Auth

The server will issue a token in response to successful request to either auth endpoint. Tokens expire 24 hours after being issued, after which the client will be required to reauthenticate.

**POST /api/auth/register**

Request body:

| Name     | Type   | Required | Notes                                                      |
| -------- | ------ | -------- | ---------------------------------------------------------- |
| username | string | yes      |
| password | string | yes      |
| role     | string | yes      | specify as "admin", "student", or "volunteer"              |
| country  | string | no\*     | \*required for volunteers, ISO-3166-1 alpha-2 country code |

Example response:

```json
{
	"message": "Welcome testUser",
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJqZWN0IjoidGVzdFVzZXIiLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTYwOTc3NTEyNSwiZXhwIjoxNjA5ODYxNTI1fQ.eEZxBwG3L2ReH3-CjINCYB_zQI8A5QL1LyfWeuiwqKg"
}
```

**POST /api/auth/login**

Request body:

| Name     | Type   | Required | Notes |
| -------- | ------ | -------- | ----- |
| username | string | yes      |
| password | string | yes      |

Example response:

```json
{
	"message": "Welcome testUser",
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJqZWN0IjoidGVzdFVzZXIiLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTYwOTc3NTE4MSwiZXhwIjoxNjA5ODYxNTgxfQ.NIXEG3OdmnjPde9HZ0mQ2PVaxXCgO7HP0uoG6KuQgOE"
}
```

### Users

**GET /api/users** (_auth required - admin_)

Responds with an array of all users.

Example response:

```json
[
	{
		"uuid": "bb16b555-270c-4cc4-9c18-f9d3a5804f82",
		"username": "admin",
		"role": "admin",
		"country": "US"
	},
	{
		"uuid": "dbc0d6aa-abb3-4cc2-be68-e956e7bfb6c8",
		"username": "student",
		"role": "student",
		"country": "US"
	},
	{
		"uuid": "73f6dac4-ca13-4d80-a845-63a1c55c40e9",
		"username": "volunteer",
		"role": "volunteer",
		"country": "US"
	}
]
```

**GET /api/users/volunteers** (_auth required - admin/student_)

Responds with an array of all users with the "volunteer" role.

Example response:

```json
[
	{
		"uuid": "73f6dac4-ca13-4d80-a845-63a1c55c40e9",
		"username": "volunteer",
		"role": "volunteer",
		"country": "US"
	}
]
```

**GET /api/users/volunteers/:country** (_auth required - admin/student_)

Responds with an array of all users with the "volunteer" role who are listed in the specified country.

Path variables:

| Variable | Notes                           |
| -------- | ------------------------------- |
| country  | ISO-3166-1 alpha-2 country code |

Example response:

```json
[
	{
		"uuid": "73f6dac4-ca13-4d80-a845-63a1c55c40e9",
		"username": "volunteer",
		"role": "volunteer",
		"country": "US"
	}
]
```

### Tasks

**GET /api/tasks** (_auth required - admin/volunteer_)

Responds differently depending on the role of the authenticated user. Admins will receive a full list of all tasks, while volunteers will receive a list of the tasks assigned to them.

Example response (volunteer):

```json
[
	{
		"uuid": "c886fd46-54d6-4d53-9889-37c23d3f8531",
		"name": "Fake Task 1",
		"description": "This is a fake task used for testing the API and database",
		"complete": true
	},
	{
		"uuid": "fdb82bec-89c8-442e-8172-dd2dd7368f3e",
		"name": "Fake Task 2",
		"description": null,
		"complete": false
	}
]
```

Example response (admin):

```json
[
	{
		"uuid": "c886fd46-54d6-4d53-9889-37c23d3f8531",
		"name": "Fake Task 1",
		"description": "This is a fake task used for testing the API and database"
	},
	{
		"uuid": "fdb82bec-89c8-442e-8172-dd2dd7368f3e",
		"name": "Fake Task 2",
		"description": null
	},
	{
		"uuid": "6f333d74-d37d-407d-af30-f138323b5c29",
		"name": "Fake Task 3",
		"description": null
	}
]
```

**GET /api/tasks/:uuid** (_auth required - admin_)

Returns the specified task object with a list of volunteers assigned to the task and the status of those assignments.

Path variables:

| Variable | Notes                   |
| -------- | ----------------------- |
| uuid     | references tasks `uuid` |

Example response:

```json
{
	"uuid": "c886fd46-54d6-4d53-9889-37c23d3f8531",
	"name": "Fake Task 1",
	"description": "This is a fake task used for testing the API and database",
	"assignments": [
		{
			"volunteer": "73f6dac4-ca13-4d80-a845-63a1c55c40e9",
			"complete": true
		}
	]
}
```

**POST /api/tasks** (_auth required - admin_)

Creates a new task and responds with the new task object.

Request body:

| Name        | Type   | Required | Notes               |
| ----------- | ------ | -------- | ------------------- |
| name        | string | yes      |
| description | string | no       | max 1000 characters |

Example response:

```json
{
	"uuid": "409a428a-194f-4b65-8dde-91abd08d3ecd",
	"name": "Post Request Test Task",
	"description": null
}
```

**PUT /api/tasks/:uuid** (_auth required - admin_)

Updates an existing task and responds with the updated task object.

Request body:

| Name        | Type   | Required | Notes               |
| ----------- | ------ | -------- | ------------------- |
| name        | string | no\*     |                     |
| description | string | no\*     | max 1000 characters |

\* At least one of the two must be specified

Example response:

```json
{
	"uuid": "c886fd46-54d6-4d53-9889-37c23d3f8531",
	"name": "An Updated Fake Task",
	"description": "This is a fake task used for testing the API and database"
}
```

**DELETE /api/tasks/:uuid** (_auth required - admin_)

Deletes an existing task and responds with the deleted task object.

Path variables:

| Variable | Notes                   |
| -------- | ----------------------- |
| uuid     | references tasks `uuid` |

Example response:

```json
{
	"uuid": "c886fd46-54d6-4d53-9889-37c23d3f8531",
	"name": "Fake Task 1",
	"description": "This is a fake task used for testing the API and database"
}
```

**POST /api/tasks/:uuid/assign** (_auth required - admin_)

Assign and/or unassign volunteers to the specified task. Responds with the specified task object and the updated list of assignments.

Path variables:

| Variable | Notes                   |
| -------- | ----------------------- |
| uuid     | references tasks `uuid` |

Request body:

| Name     | Type  | Required | Notes                                             |
| -------- | ----- | -------- | ------------------------------------------------- |
| assign   | array | no\*     | array of users `uuid`s associated with volunteers |
| unassign | array | no\*     | array of users `uuid`s associated with volunteers |

\* At least one of the two must be specified

Example response:

```json
{
	"uuid": "c886fd46-54d6-4d53-9889-37c23d3f8531",
	"name": "Fake Task 1",
	"description": "This is a fake task used for testing the API and database",
	"assignments": [
		{
			"volunteer": "73f6dac4-ca13-4d80-a845-63a1c55c40e9",
			"complete": false
		}
	]
}
```

**POST /api/tasks/:uuid/status** (_auth required - volunteer_)

Mark an assigned task as complete or incomplete. Responds with the task object and updated status.

Path variables:

| Variable | Notes                   |
| -------- | ----------------------- |
| uuid     | references tasks `uuid` |

Request body:

| Name     | Type    | Required | Notes |
| -------- | ------- | -------- | ----- |
| complete | boolean | yes      |       |

Example response:

```json
{
	"uuid": "c886fd46-54d6-4d53-9889-37c23d3f8531",
	"name": "Fake Task 1",
	"description": "This is a fake task used for testing the API and database",
	"complete": true
}
```

### Schedule

**GET /api/schedule** (_auth required_)

Responds with an array of all volunteer time slots

Example response:

```json
[
	{
		"uuid": "1e9a7d2d-4920-442d-bf82-f7edb4216c6c",
		"interval": "2021-01-01T12:01:00.000-07:00/2021-01-01T18:30:00.000-07:00",
		"volunteer": "73f6dac4-ca13-4d80-a845-63a1c55c40e9",
		"student": null
	},
	{
		"uuid": "b8b7841e-ac27-4501-98be-cafd98ae06c7",
		"interval": "2021-01-02T08:00:00.000-07:00/2021-01-02T12:30:00.000-07:00",
		"volunteer": "73f6dac4-ca13-4d80-a845-63a1c55c40e9",
		"student": "dbc0d6aa-abb3-4cc2-be68-e956e7bfb6c8"
	}
]
```

**POST /api/schedule** (_auth required - volunteer_)

Creates a new time slot or automatically merges if the new interval overlaps with an existing unreserved time slot. Responds with the authenticated volunteer's schedule.

Request body:

| Name     | Type   | Required | Notes                    |
| -------- | ------ | -------- | ------------------------ |
| interval | string | yes      | ISO 8601 interval format |

Example response:

```json
[
	{
		"uuid": "b8b7841e-ac27-4501-98be-cafd98ae06c7",
		"interval": "2021-01-02T08:00:00.000-07:00/2021-01-02T12:30:00.000-07:00",
		"volunteer": "73f6dac4-ca13-4d80-a845-63a1c55c40e9",
		"student": "dbc0d6aa-abb3-4cc2-be68-e956e7bfb6c8"
	},
	{
		"uuid": "a4880f85-22d9-4f84-b2da-da7fab7f9d40",
		"interval": "2021-01-04T14:00:00.000-07:00/2021-01-04T21:00:00.000-07:00",
		"volunteer": "73f6dac4-ca13-4d80-a845-63a1c55c40e9",
		"student": null
	}
]
```

**DELETE /api/schedule/:uuid** (_auth required - volunteer_)

Deletes specified time slot and responds with the deleted time slot object. Only works for time slots associated with the authenticated volunteer.

Path variables:

| Variable | Notes                      |
| -------- | -------------------------- |
| uuid     | references schedule `uuid` |

Example response:

```json
{
	"uuid": "0d140068-4b1c-4744-b882-bb0aa62429a1",
	"interval": "2021-01-03T00:12:00.000-07:00/2021-01-03T01:30:00.000-07:00",
	"volunteer": "73f6dac4-ca13-4d80-a845-63a1c55c40e9",
	"student": null
}
```

**GET /api/schedule/reserve** (_auth required - student_)

Responds with an array of all time slots reserved by the authenticated student

Example response:

```json
[
	{
		"uuid": "b8b7841e-ac27-4501-98be-cafd98ae06c7",
		"interval": "2021-01-02T08:00:00.000-07:00/2021-01-02T12:30:00.000-07:00",
		"volunteer": "73f6dac4-ca13-4d80-a845-63a1c55c40e9",
		"student": "dbc0d6aa-abb3-4cc2-be68-e956e7bfb6c8"
	}
]
```

**POST /api/schedule/reserve/:uuid** (_auth required - student_)

Reserves a time slot for the authenticated student. The time slot can be divided and partially reserved if specified in the optional request body. Responds with the newly reserved time slot.

Path variables:

| Variable | Notes                      |
| -------- | -------------------------- |
| uuid     | references schedule `uuid` |

Request body:

| Name     | Type   | Required | Notes                                                             |
| -------- | ------ | -------- | ----------------------------------------------------------------- |
| interval | string | no       | ISO 8601 interval format, entire slot will be reserved if omitted |

Example response:

```json
{
	"uuid": "f5b02992-02d5-4371-bcc7-393bd482710a",
	"interval": "2021-01-01T16:00:00.000-07:00/2021-01-01T17:30:00.000-07:00",
	"volunteer": "73f6dac4-ca13-4d80-a845-63a1c55c40e9",
	"student": "dbc0d6aa-abb3-4cc2-be68-e956e7bfb6c8"
}
```

**DELETE /api/schedule/reserve/:uuid** (_auth required - student_)

Removes the authenticated student's reservation for the specified time slot and returns the obsolete reservation.

Path variables:

| Variable | Notes                      |
| -------- | -------------------------- |
| uuid     | references schedule `uuid` |

Example response:

```json
{
	"uuid": "f5b02992-02d5-4371-bcc7-393bd482710a",
	"interval": "2021-01-01T16:00:00.000-07:00/2021-01-01T17:30:00.000-07:00",
	"volunteer": "73f6dac4-ca13-4d80-a845-63a1c55c40e9",
	"student": "dbc0d6aa-abb3-4cc2-be68-e956e7bfb6c8"
}
```

## Data

### User

Schema:

| Name     | Type   | Required | Notes                                                        |
| -------- | ------ | -------- | ------------------------------------------------------------ |
| uuid     | string | yes      |
| username | string | yes      |
| password | string | yes\*    | \*not included in responses to client                        |
| role     | string | yes      | "admin", "student", or "volunteer"                           |
| country  | string | no\*\*   | \*\*ISO-3166-1 alpha-2 country code, required for volunteers |

Example:

```json
{
	"uuid": "73f6dac4-ca13-4d80-a845-63a1c55c40e9",
	"username": "volunteer",
	"role": "volunteer",
	"country": "US"
}
```

### Task

Schema:

| Name        | Type   | Required | Notes               |
| ----------- | ------ | -------- | ------------------- |
| uuid        | string | yes      |
| name        | string | yes      |
| description | string | no       | max 1000 characters |

Example:

```json
{
	"uuid": "c886fd46-54d6-4d53-9889-37c23d3f8531",
	"name": "Fake Task 1",
	"description": "This is a fake task used for testing the API and database"
}
```

#### Assignment

Schema:

| Name      | Type    | Required | Notes                   |
| --------- | ------- | -------- | ----------------------- |
| task      | string  | yes      | references tasks `uuid` |
| volunteer | string  | yes      | references users `uuid` |
| complete  | boolean | yes\*    | \*default `false`       |

### Schedule

Schema:

| Name      | Type   | Required | Notes                    |
| --------- | ------ | -------- | ------------------------ |
| uuid      | string | yes      |                          |
| interval  | string | yes      | ISO 8601 interval format |
| volunteer | string | yes      | references user `uuid`   |
| student   | string | no       | references user `uuid`   |

Example:

```json
{
	"uuid": "b8b7841e-ac27-4501-98be-cafd98ae06c7",
	"interval": "2021-01-02T08:00:00.000-07:00/2021-01-02T12:30:00.000-07:00",
	"volunteer": "73f6dac4-ca13-4d80-a845-63a1c55c40e9",
	"student": "dbc0d6aa-abb3-4cc2-be68-e956e7bfb6c8"
}
```
