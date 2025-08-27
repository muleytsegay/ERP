# Employee Data Requirements for Payroll Module

To ensure the **Payroll Module** in the frontend works properly, the backend API must provide employee data with the following structure.

---

## **API Endpoint**

**GET** `/api/employees`
GET /api/payroll/export?period=YYYY-MM
GET /api/payroll/report?period=YYYY-MM

### **Response Structure**

```json
{
  "data": [
    {
      "id": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "position": "string",
      "salary": 0,
      "allowances": 0,
      "deductions": 0,
      "createdAt": "2025-08-01T00:00:00Z"
    }
  ]
}
```

e.g.
{
"data": [
{
"id": "EMP001",
"firstName": "John",
"lastName": "Doe",
"email": "john.doe@example.com",
"position": "Software Engineer",
"salary": 1500,
"allowances": 300,
"deductions": 100,
"createdAt": "2025-08-01T12:00:00Z"
}
]
}

---

## **Field Descriptions**

| Field        | Type   | Required | Description                                                   |
| ------------ | ------ | -------- | ------------------------------------------------------------- |
| `id`         | String | Yes      | Unique ID for the employee                                    |
| `firstName`  | String | Yes      | Employee's first name                                         |
| `lastName`   | String | Yes      | Employee's last name                                          |
| `email`      | String | Yes      | Employee email                                                |
| `position`   | String | Optional | Job title / role                                              |
| `salary`     | Number | **Yes**  | Base monthly salary                                           |
| `allowances` | Number | Optional | Additional benefits, bonuses, etc. Default = `0`              |
| `deductions` | Number | Optional | Total deductions (tax, loans, penalties, etc.). Default = `0` |
| `createdAt`  | String | Auto     | Employee creation timestamp                                   |

---

## **Frontend Calculation Logic**

The following calculations will be handled by the frontend (`payroll-home.component.ts`):

- **Total Employees** → `employees.length`
- **Gross Payroll** → `Σ (salary + allowances)`
- **Total Deductions** → `Σ deductions`
- **Net Payroll** → `Gross Payroll - Total Deductions`

---

## **Example API Response**

```json
{
  "data": [
    {
      "id": "EMP001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "position": "Software Engineer",
      "salary": 1500,
      "allowances": 300,
      "deductions": 100,
      "createdAt": "2025-08-01T12:00:00Z"
    },
    {
      "id": "EMP002",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com",
      "position": "Designer",
      "salary": 1200,
      "allowances": 200,
      "deductions": 50,
      "createdAt": "2025-08-05T08:30:00Z"
    }
  ]
}
```

---

## **Important Notes for Backend**

1. All numeric fields (`salary`, `allowances`, `deductions`) must be numbers, **not strings**.
2. If `allowances` or `deductions` are missing, default them to `0`.
3. Make sure the API returns **an array** inside the `data` property.
4. Any missing fields will cause calculation issues on the frontend.
