# School Cloud Backend

## Endpoints

### Auth

**POST /api/auth/register**

| Name     | Type   | Required | Notes                                         |
| -------- | ------ | -------- | --------------------------------------------- |
| username | string | yes      |
| password | string | yes      |
| role     | string | yes      | specify as "admin", "student", or "volunteer" |
| country  | string | no\*     | required when user role is "volunteer"        |

**POST /api/auth/login**

| Name     | Type   | Required | Notes |
| -------- | ------ | -------- | ----- |
| username | string | yes      |
| password | string | yes      |

### Users

### Tasks

### Schedule
