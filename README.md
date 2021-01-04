# School Cloud Backend

## Data

### Users

### Tasks

### Schedule

**Time slot**

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

## Endpoints

### Auth

**POST /api/auth/register**

Request body:

| Name     | Type   | Required | Notes                                         |
| -------- | ------ | -------- | --------------------------------------------- |
| username | string | yes      |
| password | string | yes      |
| role     | string | yes      | specify as "admin", "student", or "volunteer" |
| country  | string | no\*     | required when user role is "volunteer"        |

**POST /api/auth/login**

Request body:

| Name     | Type   | Required | Notes |
| -------- | ------ | -------- | ----- |
| username | string | yes      |
| password | string | yes      |

### Users

### Tasks

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
