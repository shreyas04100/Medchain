# MedChain REST API Design

## Overview

This document describes the REST API architecture for MedChain. It is intentionally architecture-focused and does not include implementation code.

## API Principles

- RESTful resource-oriented design
- JSON payloads
- Role-based access control
- Explicit authentication and authorization checks
- Audit logging for all sensitive operations
- Pagination and filtering support
- Idempotency for write operations where appropriate

## Authentication Model

- JWT-based authentication is assumed.
- Access tokens should be short-lived and refresh tokens rotated.
- Role-based claim enforcement should be applied at the API gateway and service layer.

---

## 1. Authentication APIs

### 1.1 Login

- Method: POST
- Path: /api/v1/auth/login
- Purpose: Authenticate a user and return an access token.
- Authentication: None
- Request:
  - email
  - password
- Response:
  - access_token
  - refresh_token
  - expires_in
  - user

### 1.2 Refresh Token

- Method: POST
- Path: /api/v1/auth/refresh
- Purpose: Refresh an access token.
- Authentication: Refresh token
- Request:
  - refresh_token
- Response:
  - access_token
  - expires_in

### 1.3 Logout

- Method: POST
- Path: /api/v1/auth/logout
- Purpose: Invalidate a session.
- Authentication: Bearer token
- Request:
  - refresh_token (optional)
- Response:
  - success: true

### 1.4 Me

- Method: GET
- Path: /api/v1/auth/me
- Purpose: Retrieve current authenticated user profile.
- Authentication: Bearer token
- Request: None
- Response:
  - user profile
  - roles
  - permissions

---

## 2. Patient APIs

### 2.1 List Patients

- Method: GET
- Path: /api/v1/patients
- Purpose: Retrieve a paginated list of patients.
- Authentication: Bearer token
- Request:
  - page
  - limit
  - search
  - status
- Response:
  - patients[]
  - pagination metadata

### 2.2 Get Patient Profile

- Method: GET
- Path: /api/v1/patients/{patientId}
- Purpose: Retrieve patient profile details.
- Authentication: Bearer token
- Request: None
- Response:
  - patient profile
  - consent status

### 2.3 Create Patient

- Method: POST
- Path: /api/v1/patients
- Purpose: Create a patient profile.
- Authentication: Bearer token
- Request:
  - user details
  - demographics
  - emergency contact
- Response:
  - created patient object

### 2.4 Update Patient

- Method: PUT
- Path: /api/v1/patients/{patientId}
- Purpose: Update patient profile data.
- Authentication: Bearer token
- Request:
  - updatable fields
- Response:
  - updated patient object

### 2.5 Delete Patient

- Method: DELETE
- Path: /api/v1/patients/{patientId}
- Purpose: Soft-delete patient profile.
- Authentication: Bearer token
- Request: None
- Response:
  - success: true

---

## 3. Doctor APIs

### 3.1 List Doctors

- Method: GET
- Path: /api/v1/doctors
- Purpose: Retrieve doctors with optional filters.
- Authentication: Bearer token
- Request:
  - specialization
  - verification_status
  - page
  - limit
- Response:
  - doctors[]
  - pagination metadata

### 3.2 Get Doctor Profile

- Method: GET
- Path: /api/v1/doctors/{doctorId}
- Purpose: Retrieve doctor profile details.
- Authentication: Bearer token
- Request: None
- Response:
  - doctor profile

### 3.3 Create Doctor

- Method: POST
- Path: /api/v1/doctors
- Purpose: Register a doctor profile.
- Authentication: Bearer token
- Request:
  - user details
  - specialization
  - license number
- Response:
  - created doctor object

### 3.4 Update Doctor

- Method: PUT
- Path: /api/v1/doctors/{doctorId}
- Purpose: Update doctor profile data.
- Authentication: Bearer token
- Request:
  - updatable fields
- Response:
  - updated doctor object

---

## 4. Medical Record APIs

### 4.1 List Medical Records

- Method: GET
- Path: /api/v1/medical-records
- Purpose: Retrieve records visible to the authenticated user.
- Authentication: Bearer token
- Request:
  - patientId
  - page
  - limit
  - filter
- Response:
  - medicalRecords[]
  - pagination metadata

### 4.2 Get Medical Record

- Method: GET
- Path: /api/v1/medical-records/{recordId}
- Purpose: Retrieve metadata and references for a medical record.
- Authentication: Bearer token
- Request: None
- Response:
  - medical record object
  - access metadata

### 4.3 Create Medical Record

- Method: POST
- Path: /api/v1/medical-records
- Purpose: Create a new medical record.
- Authentication: Bearer token
- Request:
  - patientId
  - doctorId
  - title
  - recordType
  - contentEncrypted
  - summary
- Response:
  - created record object

### 4.4 Update Medical Record

- Method: PUT
- Path: /api/v1/medical-records/{recordId}
- Purpose: Update medical record content or metadata.
- Authentication: Bearer token
- Request:
  - update payload
- Response:
  - updated record object

### 4.5 Delete Medical Record

- Method: DELETE
- Path: /api/v1/medical-records/{recordId}
- Purpose: Soft-delete a medical record.
- Authentication: Bearer token
- Request: None
- Response:
  - success: true

### 4.6 Get Record Versions

- Method: GET
- Path: /api/v1/medical-records/{recordId}/versions
- Purpose: Retrieve historical versions of a record.
- Authentication: Bearer token
- Request: None
- Response:
  - versions[]

---

## 5. Access Request APIs

### 5.1 Create Access Request

- Method: POST
- Path: /api/v1/access-requests
- Purpose: Request access to a record or patient data.
- Authentication: Bearer token
- Request:
  - patientId
  - medicalRecordId
  - reason
  - requestType
- Response:
  - created access request object

### 5.2 List Access Requests

- Method: GET
- Path: /api/v1/access-requests
- Purpose: Retrieve requests relevant to the authenticated user.
- Authentication: Bearer token
- Request:
  - status
  - page
  - limit
- Response:
  - accessRequests[]
  - pagination metadata

### 5.3 Review Access Request

- Method: PATCH
- Path: /api/v1/access-requests/{requestId}/review
- Purpose: Approve or reject an access request.
- Authentication: Bearer token
- Request:
  - status
  - decisionReason
- Response:
  - updated access request object

### 5.4 List Access Grants

- Method: GET
- Path: /api/v1/access-grants
- Purpose: Retrieve current access grants.
- Authentication: Bearer token
- Request:
  - patientId
  - page
  - limit
- Response:
  - grants[]

---

## 6. Blockchain APIs

### 6.1 Register Transaction

- Method: POST
- Path: /api/v1/blockchain/transactions
- Purpose: Register a blockchain transaction reference.
- Authentication: Bearer token
- Request:
  - txHash
  - chainName
  - network
  - entityType
  - entityId
- Response:
  - transaction object

### 6.2 Get Transaction Status

- Method: GET
- Path: /api/v1/blockchain/transactions/{txHash}
- Purpose: Retrieve a transaction record.
- Authentication: Bearer token
- Request: None
- Response:
  - transaction details

### 6.3 List Transactions

- Method: GET
- Path: /api/v1/blockchain/transactions
- Purpose: List blockchain-linked events.
- Authentication: Bearer token
- Request:
  - status
  - entityType
  - page
  - limit
- Response:
  - transactions[]

---

## 7. Audit Log APIs

### 7.1 List Audit Logs

- Method: GET
- Path: /api/v1/audit-logs
- Purpose: Retrieve audit entries for compliance review.
- Authentication: Bearer token
- Request:
  - entityType
  - entityId
  - userId
  - startDate
  - endDate
  - page
  - limit
- Response:
  - logs[]
  - pagination metadata

### 7.2 Get Audit Log

- Method: GET
- Path: /api/v1/audit-logs/{logId}
- Purpose: Review a specific audit event.
- Authentication: Bearer token
- Request: None
- Response:
  - audit log object

---

## 8. Notification APIs

### 8.1 List Notifications

- Method: GET
- Path: /api/v1/notifications
- Purpose: Retrieve current notifications for a user.
- Authentication: Bearer token
- Request:
  - unreadOnly
  - page
  - limit
- Response:
  - notifications[]
  - pagination metadata

### 8.2 Mark Notification Read

- Method: PATCH
- Path: /api/v1/notifications/{notificationId}/read
- Purpose: Mark a notification as read.
- Authentication: Bearer token
- Request: None
- Response:
  - updated notification object

### 8.3 Create Notification

- Method: POST
- Path: /api/v1/notifications
- Purpose: Create an in-app or outbound notification.
- Authentication: Bearer token
- Request:
  - userId
  - category
  - title
  - body
  - channel
- Response:
  - created notification object

---

## 9. AI APIs

### 9.1 Trigger AI Alert Analysis

- Method: POST
- Path: /api/v1/ai/alerts/analyze
- Purpose: Submit data for ML alert generation.
- Authentication: Bearer token
- Request:
  - patientId
  - inputData
  - modelType
- Response:
  - alert summary
  - alertId

### 9.2 List AI Alerts

- Method: GET
- Path: /api/v1/ai/alerts
- Purpose: Retrieve ML-generated alerts.
- Authentication: Bearer token
- Request:
  - patientId
  - status
  - severity
  - page
  - limit
- Response:
  - alerts[]
  - pagination metadata

### 9.3 Resolve AI Alert

- Method: PATCH
- Path: /api/v1/ai/alerts/{alertId}/resolve
- Purpose: Mark an ML alert as resolved or dismissed.
- Authentication: Bearer token
- Request:
  - status
  - resolutionNote
- Response:
  - updated alert object

---

## 10. Suggested Response Conventions

- Success responses should return status code 200 or 201, depending on the operation.
- Errors should use standard HTTP semantics:
  - 400 Bad Request
  - 401 Unauthorized
  - 403 Forbidden
  - 404 Not Found
  - 409 Conflict
  - 422 Unprocessable Entity
  - 500 Internal Server Error
- Response envelope should include:
  - success
  - data
  - error (optional)
  - meta (optional)
