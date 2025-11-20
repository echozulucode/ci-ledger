# REQ-001: Authentication and Authorization Requirements

## Document Information
**Module**: Authentication & Authorization  
**Version**: 1.0  
**Last Updated**: 2025-11-01  
**Status**: Active  
**Source Features**:
- `features/authentication/01-user-registration.feature`
- `features/authentication/02-user-login.feature`
- `features/authentication/03-ldap-authentication.feature`
- `features/authentication/04-password-management.feature`
- `features/authentication/05-role-based-access.feature`

---

## 1. User Registration Requirements

### REQ-AUTH-FUNC-001: Email Uniqueness Validation

**Priority**: Critical  
**Category**: Functional  
**Source Feature**: `01-user-registration.feature` - Scenario: "Registration fails with existing email"  
**Status**: Implemented

**Requirement Statement**:
The system shall validate that email addresses are unique before creating new user accounts.

**Rationale**:
Ensures one account per email address, preventing duplicate accounts and supporting account recovery.

**Acceptance Criteria**:
- [ ] Registration blocked when email already exists
- [ ] Error message "Email already registered" returned
- [ ] Database constraint enforces uniqueness
- [ ] Case-insensitive email comparison

**Dependencies**: None

**Test References**: TC-AUTH-001

---

### REQ-AUTH-FUNC-002: User Account Creation

**Priority**: Critical  
**Category**: Functional  
**Source Feature**: `01-user-registration.feature` - Scenario: "Successful registration with valid credentials"  
**Status**: Implemented

**Requirement Statement**:
WHEN a user submits valid registration information THEN the system shall create a new user account with email, full name, hashed password, and default "user" role.

**Rationale**:
Establishes the core registration workflow and ensures all required data is captured.

**Acceptance Criteria**:
- [ ] Account created with provided email and full name
- [ ] Password hashed before storage
- [ ] Default "user" role assigned automatically
- [ ] User can log in immediately after registration
- [ ] Account is active by default

**Dependencies**: 
- REQ-AUTH-SEC-001 (Password Hashing)
- REQ-AUTH-FUNC-001 (Email Uniqueness)

**Test References**: TC-AUTH-002

---

### REQ-AUTH-FUNC-003: Email Format Validation

**Priority**: High  
**Category**: Functional  
**Source Feature**: `01-user-registration.feature` - Scenario: "Registration fails with invalid email format"  
**Status**: Implemented

**Requirement Statement**:
The system shall validate that email addresses conform to RFC 5322 format before accepting registration.

**Rationale**:
Ensures valid email addresses for communication and prevents malformed data.

**Acceptance Criteria**:
- [ ] Valid email patterns accepted (user@domain.com)
- [ ] Invalid patterns rejected (no @, missing domain, spaces)
- [ ] Error message "Invalid email format" returned
- [ ] Validation occurs before database operation

**Dependencies**: None

**Test References**: TC-AUTH-003

---

### REQ-AUTH-FUNC-004: Required Field Validation

**Priority**: High  
**Category**: Functional  
**Source Feature**: `01-user-registration.feature` - Scenarios: "Registration fails with missing required fields"  
**Status**: Implemented

**Requirement Statement**:
The system shall validate that email, full name, and password are provided during registration.

**Rationale**:
Ensures complete user records and prevents incomplete account creation.

**Acceptance Criteria**:
- [ ] Registration fails if email missing
- [ ] Registration fails if full name missing
- [ ] Registration fails if password missing
- [ ] Specific error messages for each missing field
- [ ] No partial account creation on validation failure

**Dependencies**: None

**Test References**: TC-AUTH-004

---

### REQ-AUTH-FUNC-005: Multiple User Registration

**Priority**: High  
**Category**: Functional  
**Source Feature**: `01-user-registration.feature` - Scenario: "Multiple users can register with different emails"  
**Status**: Implemented

**Requirement Statement**:
The system shall support registration of multiple users with different email addresses, and each user shall be able to log in independently.

**Rationale**:
Supports multi-user environment and validates system scalability.

**Acceptance Criteria**:
- [ ] Multiple unique accounts created successfully
- [ ] Each account operates independently
- [ ] No data leakage between accounts
- [ ] Concurrent registrations supported

**Dependencies**: REQ-AUTH-FUNC-001

**Test References**: TC-AUTH-005

---

## 2. Password Security Requirements

### REQ-AUTH-SEC-001: Password Hashing

**Priority**: Critical  
**Category**: Security  
**Source Feature**: `01-user-registration.feature` - Scenario: "Registered password is securely hashed"  
**Status**: Implemented

**Requirement Statement**:
The system shall hash all passwords using Argon2id algorithm with appropriate work factor before storage, and the system shall never store plaintext passwords.

**Rationale**:
Protects user credentials from exposure in case of data breach. Argon2id is the current industry standard.

**Acceptance Criteria**:
- [ ] Argon2id hashing algorithm used
- [ ] Appropriate work factor configured (time cost ≥ 2, memory cost ≥ 19456 KB)
- [ ] Random salt generated per password
- [ ] Plaintext password never logged or stored
- [ ] Hash value differs from original password
- [ ] Hash cannot be reversed to plaintext

**Dependencies**: None

**Test References**: TC-AUTH-006, TC-SEC-001

**Notes**: Originally specified bcrypt, upgraded to Argon2id per OWASP recommendations.

---

### REQ-AUTH-SEC-002: Password Complexity Requirements

**Priority**: Critical  
**Category**: Security  
**Source Feature**: `01-user-registration.feature`, `04-password-management.feature` - Password validation scenarios  
**Status**: Implemented

**Requirement Statement**:
WHEN a user sets or changes a password THEN the system shall enforce the following complexity requirements:
- Minimum 8 characters length
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)

**Rationale**:
Reduces risk of password guessing and brute force attacks by ensuring strong passwords.

**Acceptance Criteria**:
- [ ] All five complexity rules enforced
- [ ] Clear error messages indicate which requirements failed
- [ ] Validation occurs before hashing
- [ ] Rules apply to registration and password changes
- [ ] No weak passwords accepted

**Dependencies**: None

**Test References**: TC-AUTH-007, TC-SEC-002

---

### REQ-AUTH-SEC-003: Password Storage Security

**Priority**: Critical  
**Category**: Security  
**Source Feature**: `04-password-management.feature` - Scenario: "New password is hashed with Argon2"  
**Status**: Implemented

**Requirement Statement**:
The system shall ensure that password hashes are stored securely in the database with appropriate column encryption and access controls.

**Rationale**:
Provides defense-in-depth for password protection beyond hashing.

**Acceptance Criteria**:
- [ ] Password hash column properly secured
- [ ] No plaintext passwords in logs or error messages
- [ ] Database access restricted to application service account
- [ ] Password field excluded from API responses

**Dependencies**: REQ-AUTH-SEC-001

**Test References**: TC-SEC-003

---

## 3. User Login Requirements

### REQ-AUTH-FUNC-006: Credential Validation

**Priority**: Critical  
**Category**: Functional  
**Source Feature**: `02-user-login.feature` - Scenario: "Successful login with valid credentials"  
**Status**: Implemented

**Requirement Statement**:
WHEN a user submits email and password THEN the system shall validate credentials against stored user records and issue a JWT access token upon successful authentication.

**Rationale**:
Core authentication mechanism for granting access to protected resources.

**Acceptance Criteria**:
- [ ] Email and password validated against database
- [ ] Password compared using secure hash verification
- [ ] JWT token generated on success
- [ ] Token contains user ID and role claims
- [ ] User redirected to dashboard after login

**Dependencies**: 
- REQ-AUTH-SEC-001 (Password Hashing)
- REQ-AUTH-SEC-004 (JWT Token Generation)

**Test References**: TC-AUTH-008

---

### REQ-AUTH-FUNC-007: Failed Authentication Handling

**Priority**: High  
**Category**: Functional  
**Source Feature**: `02-user-login.feature` - Scenarios: "Login fails with incorrect password", "Login fails with non-existent user"  
**Status**: Implemented

**Requirement Statement**:
IF authentication fails due to incorrect credentials THEN the system shall return a generic error message "Invalid credentials" without revealing whether the email exists.

**Rationale**:
Prevents account enumeration attacks by not disclosing account existence.

**Acceptance Criteria**:
- [ ] Same error message for wrong password and non-existent email
- [ ] No JWT token issued on failure
- [ ] User remains on login page
- [ ] No information leakage about account existence
- [ ] Failed attempts logged for security monitoring

**Dependencies**: None

**Test References**: TC-AUTH-009, TC-SEC-004

---

### REQ-AUTH-FUNC-008: Inactive Account Check

**Priority**: High  
**Category**: Functional  
**Source Feature**: `02-user-login.feature` - Scenario: "Login fails with inactive account"  
**Status**: Implemented

**Requirement Statement**:
IF a user account is marked as inactive THEN the system shall deny authentication with error "Account is inactive" and prevent access to protected resources.

**Rationale**:
Allows administrative control over account access without deletion.

**Acceptance Criteria**:
- [ ] Inactive accounts cannot authenticate
- [ ] Specific error message for inactive accounts
- [ ] No JWT token issued
- [ ] Protected resources remain inaccessible
- [ ] Active status checked before password verification

**Dependencies**: None

**Test References**: TC-AUTH-010

---

### REQ-AUTH-FUNC-009: User Logout

**Priority**: Medium  
**Category**: Functional  
**Source Feature**: `02-user-login.feature` - Scenario: "User can logout successfully"  
**Status**: Implemented

**Requirement Statement**:
WHEN a user logs out THEN the system shall terminate the user session, redirect to login page, and render the JWT token ineffective for subsequent requests.

**Rationale**:
Allows users to explicitly end their session for security.

**Acceptance Criteria**:
- [ ] Session terminated on logout
- [ ] User redirected to login page
- [ ] Token no longer accepted for API calls
- [ ] Protected resources inaccessible after logout
- [ ] Client-side token removed

**Dependencies**: None

**Test References**: TC-AUTH-011

---

### REQ-AUTH-FUNC-010: Concurrent Session Support

**Priority**: Medium  
**Category**: Functional  
**Source Feature**: `02-user-login.feature` - Scenario: "User can login from different sessions simultaneously"  
**Status**: Implemented

**Requirement Statement**:
The system shall allow users to maintain multiple active sessions simultaneously, where each session receives a unique JWT token.

**Rationale**:
Supports users accessing from multiple devices without forcing re-authentication.

**Acceptance Criteria**:
- [ ] Multiple simultaneous logins permitted
- [ ] Each session has unique JWT token
- [ ] All active tokens remain valid
- [ ] Sessions operate independently
- [ ] No session limit enforced (configurable)

**Dependencies**: REQ-AUTH-SEC-004

**Test References**: TC-AUTH-012

---

## 4. JWT Token Requirements

### REQ-AUTH-SEC-004: JWT Token Generation

**Priority**: Critical  
**Category**: Security  
**Source Feature**: `02-user-login.feature` - Scenario: "JWT token includes correct user information"  
**Status**: Implemented

**Requirement Statement**:
WHEN a user authenticates successfully THEN the system shall generate a JWT access token containing user ID in the 'sub' claim, admin status in 'is_admin' claim, and an expiration time.

**Rationale**:
Provides stateless authentication mechanism with embedded user identity and role information.

**Acceptance Criteria**:
- [ ] JWT token generated using HS256 algorithm
- [ ] Token includes 'sub' claim with user ID
- [ ] Token includes 'is_admin' claim (boolean)
- [ ] Token includes 'exp' claim for expiration
- [ ] Token signed with secret key
- [ ] Token format conforms to RFC 7519

**Dependencies**: None

**Test References**: TC-AUTH-013, TC-SEC-005

---

### REQ-AUTH-SEC-005: JWT Token Expiration

**Priority**: High  
**Category**: Security  
**Source Feature**: `02-user-login.feature` - Scenario: "Expired JWT token is rejected"  
**Status**: Implemented

**Requirement Statement**:
The system shall reject JWT tokens that have exceeded their expiration time with error "Token expired", and the system shall require re-authentication.

**Rationale**:
Limits window of vulnerability if token is compromised.

**Acceptance Criteria**:
- [ ] Token expiration enforced on all API calls
- [ ] Expired tokens return 401 Unauthorized
- [ ] Error message indicates token expiration
- [ ] User must re-authenticate to obtain new token
- [ ] Expiration time configurable (default: 60 minutes)

**Dependencies**: REQ-AUTH-SEC-004

**Test References**: TC-AUTH-014, TC-SEC-006

---

### REQ-AUTH-SEC-006: JWT Token Integrity Validation

**Priority**: Critical  
**Category**: Security  
**Source Feature**: `02-user-login.feature` - Scenario: "Tampered JWT token is rejected"  
**Status**: Implemented

**Requirement Statement**:
IF a JWT token payload or signature is modified THEN the system shall reject the token with error "Invalid token" and deny access to protected resources.

**Rationale**:
Prevents token tampering and privilege escalation attacks.

**Acceptance Criteria**:
- [ ] Token signature verified on every request
- [ ] Modified tokens rejected immediately
- [ ] Invalid tokens return 401 Unauthorized
- [ ] No access granted with tampered token
- [ ] Tampering attempts logged

**Dependencies**: REQ-AUTH-SEC-004

**Test References**: TC-AUTH-015, TC-SEC-007

---

### REQ-AUTH-SEC-007: JWT Token Usage for API Authentication

**Priority**: Critical  
**Category**: Security  
**Source Feature**: `02-user-login.feature` - Scenario: "JWT token includes correct user information"  
**Status**: Implemented

**Requirement Statement**:
The system shall authenticate API requests using JWT tokens provided in the Authorization header with Bearer scheme.

**Rationale**:
Provides secure, stateless API authentication mechanism.

**Acceptance Criteria**:
- [ ] Token accepted in Authorization header
- [ ] Format: "Bearer <token>"
- [ ] Token validated on each API request
- [ ] User identity extracted from token claims
- [ ] Invalid/missing tokens return 401

**Dependencies**: REQ-AUTH-SEC-004

**Test References**: TC-AUTH-016

---

## 5. LDAP Authentication Requirements

### REQ-AUTH-INT-001: LDAP Authentication Integration

**Priority**: High  
**Category**: Integration  
**Source Feature**: `03-ldap-authentication.feature` - Scenario: "Successful LDAP authentication with valid AD credentials"  
**Status**: Implemented

**Requirement Statement**:
WHERE LDAP authentication is enabled, WHEN a user submits LDAP credentials THEN the system shall authenticate against Active Directory and auto-provision a local account on first successful login.

**Rationale**:
Enables enterprise SSO by leveraging existing Active Directory infrastructure.

**Acceptance Criteria**:
- [ ] LDAP bind operation performed with user credentials
- [ ] Successful LDAP authentication verified
- [ ] Local account auto-created on first login
- [ ] JWT token issued after LDAP authentication
- [ ] User can access application

**Dependencies**: 
- REQ-AUTH-FUNC-006
- REQ-AUTH-SEC-004

**Test References**: TC-AUTH-017, TC-INT-001

---

### REQ-AUTH-INT-002: LDAP User Provisioning

**Priority**: High  
**Category**: Integration  
**Source Feature**: `03-ldap-authentication.feature` - Scenario: "LDAP user is provisioned with correct attributes"  
**Status**: Implemented

**Requirement Statement**:
WHEN an LDAP user authenticates for the first time THEN the system shall create a local user account with email, full name, and active status populated from LDAP attributes, and mark the account as LDAP-sourced.

**Rationale**:
Synchronizes user data from LDAP directory for local application use.

**Acceptance Criteria**:
- [ ] Email extracted from LDAP mail attribute
- [ ] Full name extracted from LDAP displayName or cn
- [ ] Account marked as active
- [ ] LDAP flag set to true
- [ ] No password stored locally for LDAP users
- [ ] Account linked to LDAP username

**Dependencies**: REQ-AUTH-INT-001

**Test References**: TC-AUTH-018, TC-INT-002

---

### REQ-AUTH-INT-003: LDAP Group-Based Role Assignment

**Priority**: High  
**Category**: Integration  
**Source Feature**: `03-ldap-authentication.feature` - Scenarios: "LDAP user receives admin role from AD group membership"  
**Status**: Implemented

**Requirement Statement**:
WHERE LDAP group mapping is configured, WHEN an LDAP user authenticates THEN the system shall assign admin role if user is member of configured admin groups, otherwise assign user role.

**Rationale**:
Automates role assignment based on organizational structure in Active Directory.

**Acceptance Criteria**:
- [ ] LDAP group membership queried during authentication
- [ ] Admin role assigned if user in admin groups
- [ ] User role assigned if user not in admin groups
- [ ] Group mapping configurable via environment variables
- [ ] Multiple admin groups supported (comma-separated)
- [ ] Case-insensitive group name matching

**Dependencies**: 
- REQ-AUTH-INT-001
- REQ-AUTH-INT-002

**Test References**: TC-AUTH-019, TC-INT-003

---

### REQ-AUTH-INT-004: LDAP Group Filtering

**Priority**: Medium  
**Category**: Integration  
**Source Feature**: `03-ldap-authentication.feature` - Scenario: "LDAP user is denied access if not in allowed groups"  
**Status**: Implemented

**Requirement Statement**:
WHERE LDAP group filtering is enabled, IF a user is not member of allowed groups THEN the system shall deny authentication with error "User not in allowed groups" and prevent account provisioning.

**Rationale**:
Restricts application access to authorized organizational units or teams.

**Acceptance Criteria**:
- [ ] Allowed groups configurable
- [ ] Group membership verified during authentication
- [ ] Authentication denied if user not in allowed groups
- [ ] No account provisioned for unauthorized users
- [ ] Error message indicates group requirement
- [ ] Group filter is optional (default: all LDAP users allowed)

**Dependencies**: REQ-AUTH-INT-001

**Test References**: TC-AUTH-020, TC-INT-004

---

### REQ-AUTH-INT-005: LDAP Role Synchronization

**Priority**: Medium  
**Category**: Integration  
**Source Feature**: `03-ldap-authentication.feature` - Scenario: "LDAP user role is updated based on current group membership"  
**Status**: Implemented

**Requirement Statement**:
WHEN an existing LDAP user authenticates THEN the system shall update the user's role based on current LDAP group membership.

**Rationale**:
Keeps application roles synchronized with organizational changes in Active Directory.

**Acceptance Criteria**:
- [ ] Group membership checked on each LDAP login
- [ ] Role updated if group membership changed
- [ ] Admin role granted if added to admin group
- [ ] Admin role revoked if removed from admin group
- [ ] Role changes logged for audit
- [ ] Changes effective immediately

**Dependencies**: REQ-AUTH-INT-003

**Test References**: TC-AUTH-021, TC-INT-005

---

### REQ-AUTH-INT-006: Local Admin Fallback

**Priority**: High  
**Category**: Integration  
**Source Feature**: `03-ldap-authentication.feature` - Scenario: "Local admin user can login when LDAP is configured"  
**Status**: Implemented

**Requirement Statement**:
WHERE LDAP authentication is enabled, the system shall allow local admin accounts to authenticate using local credentials without consulting LDAP.

**Rationale**:
Ensures administrative access even if LDAP is unavailable or misconfigured.

**Acceptance Criteria**:
- [ ] Local accounts identified by database flag
- [ ] Local authentication bypass LDAP completely
- [ ] Admin users can always use local auth
- [ ] No LDAP queries for local accounts
- [ ] Emergency access maintained

**Dependencies**: REQ-AUTH-FUNC-006

**Test References**: TC-AUTH-022, TC-INT-006

---

### REQ-AUTH-INT-007: LDAP Unavailability Handling

**Priority**: High  
**Category**: Integration  
**Source Feature**: `03-ldap-authentication.feature` - Scenarios: "LDAP authentication falls back gracefully when LDAP unavailable"  
**Status**: Implemented

**Requirement Statement**:
IF the LDAP server is unreachable THEN the system shall allow local account authentication to proceed normally and log the LDAP unavailability error.

**Rationale**:
Maintains system availability when LDAP infrastructure has issues.

**Acceptance Criteria**:
- [ ] LDAP connection timeout handled gracefully
- [ ] Local accounts continue to function
- [ ] LDAP unavailability logged
- [ ] Error message appropriate for end users
- [ ] System remains operational
- [ ] LDAP-only users cannot authenticate until restored

**Dependencies**: None

**Test References**: TC-AUTH-023, TC-INT-007

---

### REQ-AUTH-INT-008: LDAP Connection Testing

**Priority**: Medium  
**Category**: Integration  
**Source Feature**: `03-ldap-authentication.feature` - Scenario: "Admin can test LDAP connection"  
**Status**: Implemented

**Requirement Statement**:
The system shall provide a health check endpoint that allows administrators to test LDAP connectivity and configuration without exposing sensitive credentials.

**Rationale**:
Enables troubleshooting of LDAP configuration issues.

**Acceptance Criteria**:
- [ ] Health endpoint includes LDAP status
- [ ] Connection test performed on demand
- [ ] Status indicates reachable/unreachable
- [ ] No passwords exposed in response
- [ ] Admin-only access to health endpoint
- [ ] Response includes connection latency

**Dependencies**: None

**Test References**: TC-AUTH-024, TC-INT-008

---

### REQ-AUTH-SEC-008: LDAP Credential Security

**Priority**: Critical  
**Category**: Security  
**Source Feature**: `03-ldap-authentication.feature` - Scenario: "LDAP credentials are not logged or exposed"  
**Status**: Implemented

**Requirement Statement**:
The system shall never log LDAP passwords, expose LDAP bind credentials in error messages, or include sensitive LDAP data in application logs.

**Rationale**:
Protects user credentials and service account credentials from exposure.

**Acceptance Criteria**:
- [ ] User LDAP passwords never logged
- [ ] Bind DN password never logged
- [ ] Credentials redacted in error messages
- [ ] Credentials excluded from debug logs
- [ ] Secure credential storage for bind account
- [ ] No credentials in exception stack traces

**Dependencies**: None

**Test References**: TC-SEC-008

---

### REQ-AUTH-SEC-009: LDAP Secure Connection

**Priority**: Critical  
**Category**: Security  
**Source Feature**: `03-ldap-authentication.feature` - Scenario: "LDAP connection uses secure protocol"  
**Status**: Implemented

**Requirement Statement**:
WHERE LDAP authentication is configured, the system shall use LDAPS (LDAP over SSL/TLS) protocol with certificate validation to connect to the LDAP server.

**Rationale**:
Protects credentials and user data in transit to LDAP server.

**Acceptance Criteria**:
- [ ] LDAPS protocol used (port 636)
- [ ] TLS encryption enforced
- [ ] Server certificate validated
- [ ] Certificate validation configurable (for self-signed)
- [ ] Insecure LDAP (port 389) rejected by default
- [ ] TLS version 1.2 or higher required

**Dependencies**: None

**Test References**: TC-SEC-009, TC-INT-009

---

## 6. Password Management Requirements

### REQ-AUTH-FUNC-011: Password Change

**Priority**: High  
**Category**: Functional  
**Source Feature**: `04-password-management.feature` - Scenario: "User changes password successfully"  
**Status**: Implemented

**Requirement Statement**:
WHEN a local user provides correct current password and valid new password THEN the system shall update the password and allow login with the new password.

**Rationale**:
Allows users to maintain their own password security.

**Acceptance Criteria**:
- [ ] Current password verified before change
- [ ] New password validated for complexity
- [ ] Password updated in database
- [ ] Success message displayed
- [ ] User can login with new password immediately
- [ ] Old password no longer works

**Dependencies**: 
- REQ-AUTH-SEC-001
- REQ-AUTH-SEC-002

**Test References**: TC-AUTH-025

---

### REQ-AUTH-FUNC-012: Current Password Verification

**Priority**: High  
**Category**: Functional  
**Source Feature**: `04-password-management.feature` - Scenario: "Password change fails with incorrect current password"  
**Status**: Implemented

**Requirement Statement**:
IF a user provides incorrect current password during password change THEN the system shall deny the operation with error "Current password is incorrect".

**Rationale**:
Prevents unauthorized password changes if session is compromised.

**Acceptance Criteria**:
- [ ] Current password validated before accepting change
- [ ] Incorrect password rejected
- [ ] Clear error message provided
- [ ] Password remains unchanged on failure
- [ ] Failed attempts logged

**Dependencies**: REQ-AUTH-FUNC-011

**Test References**: TC-AUTH-026

---

### REQ-AUTH-FUNC-013: LDAP User Password Restriction

**Priority**: High  
**Category**: Functional  
**Source Feature**: `04-password-management.feature` - Scenario: "LDAP user cannot change password in application"  
**Status**: Implemented

**Requirement Statement**:
IF a user is authenticated via LDAP THEN the system shall deny password change requests with error "LDAP users must change password in Active Directory".

**Rationale**:
Prevents password desynchronization between application and LDAP directory.

**Acceptance Criteria**:
- [ ] LDAP users identified via account flag
- [ ] Password change UI disabled for LDAP users
- [ ] API requests denied for LDAP users
- [ ] Clear error message with guidance
- [ ] Users directed to LDAP/AD for password changes

**Dependencies**: REQ-AUTH-INT-002

**Test References**: TC-AUTH-027, TC-INT-010

---

### REQ-AUTH-FUNC-014: Admin Password Reset

**Priority**: Medium  
**Category**: Functional  
**Source Feature**: `04-password-management.feature` - Scenario: "Admin can reset user password"  
**Status**: Implemented

**Requirement Statement**:
WHEN an admin resets a user password THEN the system shall generate a temporary password, notify the user, and require password change on first login.

**Rationale**:
Provides administrative support for password recovery.

**Acceptance Criteria**:
- [ ] Admin can trigger password reset
- [ ] Temporary password generated securely
- [ ] User notified of password reset
- [ ] Temporary password allows login
- [ ] User forced to change password on first use
- [ ] Temporary password expires after first login

**Dependencies**: 
- REQ-AUTH-FUNC-011
- REQ-AUTH-RBAC-001

**Test References**: TC-AUTH-028, TC-ADMIN-001

---

### REQ-AUTH-SEC-010: Password Change Re-authentication

**Priority**: Medium  
**Category**: Security  
**Source Feature**: `04-password-management.feature` - Scenario: "Password change requires re-authentication"  
**Status**: Implemented

**Requirement Statement**:
IF a user session is older than 30 minutes THEN the system shall require re-authentication before allowing password change.

**Rationale**:
Prevents password changes from unattended sessions.

**Acceptance Criteria**:
- [ ] Session age checked before password change
- [ ] Re-authentication prompted if session > 30 minutes
- [ ] Current password required for verification
- [ ] Password change proceeds after verification
- [ ] Session age timer configurable

**Dependencies**: None

**Test References**: TC-SEC-010

---

## 7. Role-Based Access Control Requirements

### REQ-AUTH-RBAC-001: Admin Endpoint Access Control

**Priority**: Critical  
**Category**: Functional  
**Source Feature**: `05-role-based-access.feature` - Scenarios: Access control by endpoint and role  
**Status**: Implemented

**Requirement Statement**:
The system shall grant access to admin-only endpoints only to users with admin role, and deny access to users with user role with HTTP 403 status.

**Rationale**:
Enforces role-based access control to protect administrative functions.

**Acceptance Criteria**:
- [ ] Admin role can access all admin endpoints
- [ ] User role denied access to admin endpoints
- [ ] HTTP 403 returned for forbidden access
- [ ] Error message: "Insufficient permissions"
- [ ] Role checked on every request
- [ ] Endpoint-to-role mapping enforced

**Dependencies**: 
- REQ-AUTH-FUNC-006
- REQ-AUTH-SEC-004

**Test References**: TC-AUTH-029, TC-RBAC-001

**Notes**: Admin endpoints include: `/api/users/*` (except `/api/users/me`)

---

### REQ-AUTH-RBAC-002: Unauthenticated Access Denial

**Priority**: Critical  
**Category**: Functional  
**Source Feature**: `05-role-based-access.feature` - Scenario: "Unauthenticated user cannot access protected endpoints"  
**Status**: Implemented

**Requirement Statement**:
IF a user is not authenticated THEN the system shall deny access to all protected endpoints with HTTP 401 status.

**Rationale**:
Ensures all protected resources require authentication.

**Acceptance Criteria**:
- [ ] Missing JWT token returns 401
- [ ] Invalid JWT token returns 401
- [ ] User prompted to authenticate
- [ ] Public endpoints remain accessible
- [ ] Protected resources inaccessible without auth

**Dependencies**: REQ-AUTH-SEC-004

**Test References**: TC-AUTH-030, TC-RBAC-002

---

### REQ-AUTH-RBAC-003: Role Claim in JWT

**Priority**: High  
**Category**: Functional  
**Source Feature**: `05-role-based-access.feature` - Scenarios: Role inclusion in JWT claims  
**Status**: Implemented

**Requirement Statement**:
The system shall include the user's admin status in JWT token as boolean claim 'is_admin' where true indicates admin role and false indicates user role.

**Rationale**:
Embeds authorization information in token for stateless access control.

**Acceptance Criteria**:
- [ ] is_admin claim present in all JWT tokens
- [ ] is_admin = true for admin role
- [ ] is_admin = false for user role
- [ ] Claim used for authorization decisions
- [ ] Claim cannot be modified without invalidating token

**Dependencies**: REQ-AUTH-SEC-004

**Test References**: TC-AUTH-031, TC-RBAC-003

---

### REQ-AUTH-RBAC-004: Privilege Escalation Prevention

**Priority**: Critical  
**Category**: Security  
**Source Feature**: `05-role-based-access.feature` - Scenario: "User cannot elevate their own privileges"  
**Status**: Implemented

**Requirement Statement**:
The system shall deny attempts by users to modify their own role, preventing privilege escalation.

**Rationale**:
Prevents unauthorized access to administrative functions.

**Acceptance Criteria**:
- [ ] Users cannot update own role field
- [ ] API rejects self-role-modification requests
- [ ] Role remains unchanged after attempt
- [ ] Attempt logged for security monitoring
- [ ] HTTP 403 returned

**Dependencies**: REQ-AUTH-RBAC-001

**Test References**: TC-SEC-011, TC-RBAC-004

---

### REQ-AUTH-RBAC-005: Admin Role Assignment

**Priority**: High  
**Category**: Functional  
**Source Feature**: `05-role-based-access.feature` - Scenarios: "Admin can assign/revoke roles"  
**Status**: Implemented

**Requirement Statement**:
WHEN an admin modifies a user's role THEN the system shall update the role and apply new permissions immediately.

**Rationale**:
Provides administrative control over user authorization.

**Acceptance Criteria**:
- [ ] Admin can change any user's role
- [ ] Role update persisted to database
- [ ] New permissions effective immediately
- [ ] Role change logged for audit
- [ ] User notified of role change (optional)

**Dependencies**: REQ-AUTH-RBAC-001

**Test References**: TC-AUTH-032, TC-RBAC-005

---

### REQ-AUTH-RBAC-006: User Data Access Control

**Priority**: High  
**Category**: Security  
**Source Feature**: `05-role-based-access.feature` - Scenarios: User profile access  
**Status**: Implemented

**Requirement Statement**:
The system shall allow users to access only their own profile data, and deny access to other users' profiles with HTTP 403 status, except for admins who can access all profiles.

**Rationale**:
Protects user privacy and personal information.

**Acceptance Criteria**:
- [ ] Users can access /api/users/me
- [ ] Users denied access to /api/users/{other_id}
- [ ] Admins can access all user profiles
- [ ] HTTP 403 for unauthorized access
- [ ] User ID validated against JWT claims

**Dependencies**: 
- REQ-AUTH-RBAC-001
- REQ-AUTH-SEC-004

**Test References**: TC-AUTH-033, TC-RBAC-006

---

### REQ-AUTH-RBAC-007: Token-Based Authorization

**Priority**: High  
**Category**: Security  
**Source Feature**: `05-role-based-access.feature` - Scenarios: PAT authorization  
**Status**: Implemented

**Requirement Statement**:
WHEN a user makes API requests with Personal Access Token THEN the system shall enforce role-based access control using the role associated with the token's owner.

**Rationale**:
Ensures API tokens respect same authorization rules as interactive sessions.

**Acceptance Criteria**:
- [ ] PAT includes user's role information
- [ ] Admin PATs grant admin access
- [ ] User PATs restricted to user access
- [ ] Role enforced on all API requests
- [ ] Token role cannot be elevated

**Dependencies**: 
- REQ-AUTH-RBAC-001
- REQ-PAT-FUNC-001

**Test References**: TC-AUTH-034, TC-RBAC-007, TC-PAT-003

---

### REQ-AUTH-SEC-011: Token Role Tampering Prevention

**Priority**: Critical  
**Category**: Security  
**Source Feature**: `05-role-based-access.feature` - Scenario: "Role cannot be tampered in JWT token"  
**Status**: Implemented

**Requirement Statement**:
IF a JWT token's role claim is modified THEN the system shall reject the token as invalid due to signature mismatch.

**Rationale**:
Prevents privilege escalation through token manipulation.

**Acceptance Criteria**:
- [ ] Token signature validates all claims
- [ ] Modified tokens fail signature verification
- [ ] Invalid token returns 401 Unauthorized
- [ ] Access denied to all resources
- [ ] Tampering attempts logged

**Dependencies**: REQ-AUTH-SEC-006

**Test References**: TC-SEC-012, TC-RBAC-008

---

## Summary

### Requirements by Category
- **Functional**: 14 requirements
- **Security**: 11 requirements
- **Integration**: 8 requirements
- **RBAC**: 7 requirements

**Total**: 40 requirements

### Requirements by Priority
- **Critical**: 18 requirements
- **High**: 18 requirements
- **Medium**: 4 requirements

### Coverage
- **Feature Files**: 5
- **Scenarios**: 63
- **Test Cases**: 34+ (referenced)

---

**Document Status**: Complete  
**Review Status**: Pending stakeholder review  
**Next Review**: TBD
