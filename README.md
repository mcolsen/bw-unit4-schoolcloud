# School Cloud Backend

## Endpoints

The server makes the following endpoints available to clients. Most require authentication using a JSON Web Token. A few allow requests from users of any role, but most are restricted to particular user roles. Authentication requirements, if any, for each endpoint are indicated in italics. If authentication is required but no user roles are listed, that endpoint is accessible to all users.

### Auth

The server will issue a token in response to successful request to either auth endpoint. Tokens expire 24 hours after being issued, after which the client will be required to reauthenticate.

**POST /api/auth/register**

Request body:

| Name     | Type   | Required | Notes                                                    |
| -------- | ------ | -------- | -------------------------------------------------------- |
| username | string | yes      |
| password | string | yes      |
| role     | string | yes      | specify as "admin", "student", or "volunteer"            |
| country  | string | no\*     | ISO-3166-1 alpha-2 country code, required for volunteers |

**POST /api/auth/login**

Request body:

| Name     | Type   | Required | Notes |
| -------- | ------ | -------- | ----- |
| username | string | yes      |
| password | string | yes      |

### Users

**GET /api/users** (_auth required - admin_)

**GET /api/users/volunteers** (_auth required - admin/student_)

**GET /api/users/volunteers/:country** (_auth required - admin/student_)

Path variables:

| Variable | Notes                           |
| -------- | ------------------------------- |
| country  | ISO-3166-1 alpha-2 country code |

### Tasks

**GET /api/tasks** (_auth required - admin/volunteer_)

**GET /api/tasks/:uuid** (_auth required - admin_)

**POST /api/tasks** (_auth required - admin_)

**PUT /api/tasks/:uuid** (_auth required - admin_)

**DELETE /api/tasks/:uuid** (_auth required - admin_)

**POST /api/tasks/:uuid/assign** (_auth required - admin_)

**POST /api/tasks/:uuid/status** (_auth required - volunteer_)

### Schedule

**GET /api/schedule** (_auth required_)

**POST /api/schedule** (_auth required - volunteer_)

Request body:

| Name     | Type   | Required | Notes                    |
| -------- | ------ | -------- | ------------------------ |
| interval | string | yes      | ISO 8601 interval format |

**DELETE /api/schedule/:uuid** (_auth required - volunteer_)

**GET /api/schedule/reserve** (_auth required - student_)

**POST /api/schedule/reserve/:uuid** (_auth required - student_)

Request body:

| Name     | Type   | Required | Notes                                                             |
| -------- | ------ | -------- | ----------------------------------------------------------------- |
| interval | string | no       | ISO 8601 interval format, entire slot will be reserved if omitted |

**DELETE /api/schedule/reserve/:uuid** (_auth required - student_)

## Data

### User

Schema:

| Name     | Type   | Required | Notes                                                    |
| -------- | ------ | -------- | -------------------------------------------------------- |
| uuid     | string | yes      |
| username | string | yes      |
| password | string | yes\*    | not included in responses to client                      |
| role     | string | yes      | "admin", "student", or "volunteer"                       |
| country  | string | no\*     | ISO-3166-1 alpha-2 country code, required for volunteers |

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

| Name        | Type   | Required | Notes              |
| ----------- | ------ | -------- | ------------------ |
| uuid        | string | yes      |
| name        | string | yes      |
| description | string | no       | 1000 character max |

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
| complete  | boolean | yes\*    | default `false`         |

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
