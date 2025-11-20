# REQ-002: User Management Requirements

## Document Information
**Module**: User Management  
**Version**: 1.0  
**Last Updated**: 2025-11-01  
**Status**: Active  
**Source Features**:
- `features/user-management/01-profile-management.feature`
- `features/user-management/02-admin-user-crud.feature`
- `features/user-management/03-user-search.feature`

---

## 1. Profile Management Requirements

### REQ-USER-FUNC-001: Profile Viewing

**Priority**: High  
**Category**: Functional  
**Source Feature**: `01-profile-management.feature` - Scenario: "User views their own profile"  
**Status**: Implemented

**Requirement Statement**:
The system shall allow authenticated users to view their own profile information including email, full name, active status, role, and authentication type.

**Rationale**:
Users need visibility into their account information for verification and updates.

**Acceptance Criteria**:
- [ ] User can access /api/users/me endpoint
- [ ] Profile displays email, full_name, is_active, role
- [ ] Authentication type (Local/LDAP) displayed
- [ ] Password field never displayed
- [ ] API returns user's own data only

**Dependencies**: REQ-AUTH-RBAC-006

**Test References**: TC-USER-001

---

### REQ-USER-FUNC-002: Profile Full Name Update

**Priority**: Medium  
**Category**: Functional  
**Source Feature**: `01-profile-management.feature` - Scenario: "User updates their full name"  
**Status**: Implemented

**Requirement Statement**:
WHEN a user updates their full name THEN the system shall persist the change and display a success message.

**Rationale**:
Allows users to maintain accurate personal information.

**Acceptance Criteria**:
- [ ] Full name update accepted
- [ ] Change persisted to database
- [ ] Success message displayed
- [ ] Updated name reflected immediately
- [ ] Validation ensures name not empty

**Dependencies**: None

**Test References**: TC-USER-002

---

### REQ-USER-FUNC-003: Profile Email Update with Uniqueness Check

**Priority**: High  
**Category**: Functional  
**Source Feature**: `01-profile-management.feature` - Scenarios: "User updates their email address", "User cannot update email to existing email"  
**Status**: Implemented

**Requirement Statement**:
WHEN a user updates their email address THEN the system shall validate uniqueness before accepting the change, and IF email already exists THEN return error "Email already in use".

**Rationale**:
Maintains email uniqueness constraint while allowing legitimate email updates.

**Acceptance Criteria**:
- [ ] Email update validated for uniqueness
- [ ] Existing email rejected with specific error
- [ ] Valid unique email accepted
- [ ] User can login with new email immediately
- [ ] Email format validated before update

**Dependencies**: 
- REQ-AUTH-FUNC-001
- REQ-AUTH-FUNC-003

**Test References**: TC-USER-003, TC-USER-004

---

### REQ-USER-FUNC-004: Profile Access Restriction

**Priority**: Critical  
**Category**: Security  
**Source Feature**: `01-profile-management.feature` - Scenarios: "User cannot update another user's profile", "User cannot view other users' profiles"  
**Status**: Implemented

**Requirement Statement**:
The system shall deny access to user profiles other than the authenticated user's own profile with HTTP 403 Forbidden error, except for administrators.

**Rationale**:
Protects user privacy and prevents unauthorized data access.

**Acceptance Criteria**:
- [ ] Users can only access own profile via /api/users/me
- [ ] Direct access to /api/users/{other_id} denied for non-admins
- [ ] HTTP 403 returned for unauthorized attempts
- [ ] No profile information leaked in error messages
- [ ] Admins can access all profiles

**Dependencies**: REQ-AUTH-RBAC-006

**Test References**: TC-USER-005, TC-SEC-013

---

### REQ-USER-FUNC-005: LDAP User Profile Restrictions

**Priority**: High  
**Category**: Functional  
**Source Feature**: `01-profile-management.feature` - Scenario: "LDAP user can view but not edit core profile fields"  
**Status**: Implemented

**Requirement Statement**:
WHERE a user is authenticated via LDAP, the system shall mark email and full name fields as read-only and prevent updates to these fields.

**Rationale**:
LDAP-sourced data must remain synchronized with Active Directory.

**Acceptance Criteria**:
- [ ] LDAP users identified by ldap_user flag
- [ ] Email field marked read-only for LDAP users
- [ ] Full name field marked read-only for LDAP users
- [ ] Update attempts rejected with appropriate error
- [ ] Message directs users to update in Active Directory
- [ ] Local users can update these fields normally

**Dependencies**: REQ-AUTH-INT-002

**Test References**: TC-USER-006, TC-INT-011

---

### REQ-USER-UI-001: Authentication Type Display

**Priority**: Low  
**Category**: UI  
**Source Feature**: `01-profile-management.feature` - Scenarios: "Profile shows LDAP/local user indicator"  
**Status**: Implemented

**Requirement Statement**:
The system shall display the authentication type (Local or LDAP) on the user profile with appropriate guidance for credential management.

**Rationale**:
Informs users where to manage their authentication credentials.

**Acceptance Criteria**:
- [ ] "Authentication: Local" displayed for local users
- [ ] "Authentication: LDAP" displayed for LDAP users
- [ ] LDAP profiles show AD credential management note
- [ ] Local profiles show password change option
- [ ] Display distinguishes account types clearly

**Dependencies**: None

**Test References**: TC-USER-007

---

## 2. Admin User CRUD Requirements

### REQ-USER-FUNC-006: Admin User List Viewing

**Priority**: High  
**Category**: Functional  
**Source Feature**: `02-admin-user-crud.feature` - Scenario: "Admin views list of all users"  
**Status**: Implemented

**Requirement Statement**:
WHEN an administrator accesses the user management interface THEN the system shall display a list of all users with email, full name, role, and active status.

**Rationale**:
Provides administrators with comprehensive user oversight.

**Acceptance Criteria**:
- [ ] All users retrieved from database
- [ ] Display includes email, full_name, role, is_active
- [ ] Both active and inactive users shown
- [ ] LDAP and local users differentiated
- [ ] List accessible only to admins

**Dependencies**: REQ-AUTH-RBAC-001

**Test References**: TC-USER-008, TC-ADMIN-002

---

### REQ-USER-FUNC-007: Admin User Creation

**Priority**: High  
**Category**: Functional  
**Source Feature**: `02-admin-user-crud.feature` - Scenario: "Admin creates a new user"  
**Status**: Implemented

**Requirement Statement**:
WHEN an administrator creates a new user with email, full name, password, and role THEN the system shall create the account and allow immediate login with provided credentials.

**Rationale**:
Enables administrative provisioning of user accounts.

**Acceptance Criteria**:
- [ ] Admin provides email, full_name, password, role
- [ ] Password validated for complexity
- [ ] Email validated for uniqueness
- [ ] Password securely hashed before storage
- [ ] User can login immediately after creation
- [ ] Account active by default

**Dependencies**: 
- REQ-AUTH-FUNC-001
- REQ-AUTH-FUNC-002
- REQ-AUTH-SEC-001
- REQ-AUTH-SEC-002

**Test References**: TC-USER-009, TC-ADMIN-003

---

### REQ-USER-FUNC-008: Admin User Update

**Priority**: Medium  
**Category**: Functional  
**Source Feature**: `02-admin-user-crud.feature` - Scenario: "Admin updates user information"  
**Status**: Implemented

**Requirement Statement**:
WHEN an administrator modifies user information THEN the system shall update the specified fields and reflect changes immediately in the user list.

**Rationale**:
Allows administrative correction and maintenance of user data.

**Acceptance Criteria**:
- [ ] Admin can update email, full_name, role, is_active
- [ ] Email uniqueness validated on update
- [ ] Changes persisted to database
- [ ] Updates reflected immediately
- [ ] Change history logged for audit

**Dependencies**: REQ-AUTH-RBAC-001

**Test References**: TC-USER-010, TC-ADMIN-004

---

### REQ-USER-FUNC-009: Admin User Activation/Deactivation

**Priority**: High  
**Category**: Functional  
**Source Feature**: `02-admin-user-crud.feature` - Scenarios: "Admin activates/deactivates user account"  
**Status**: Implemented

**Requirement Statement**:
WHEN an administrator changes a user's active status THEN the system shall update the status, where deactivated users cannot login but existing sessions remain valid until expiration.

**Rationale**:
Provides administrative control over account access without deletion.

**Acceptance Criteria**:
- [ ] Admin can activate inactive accounts
- [ ] Admin can deactivate active accounts
- [ ] Status change persisted immediately
- [ ] Deactivated users cannot login
- [ ] Existing sessions not immediately invalidated
- [ ] Activation restores login capability

**Dependencies**: REQ-AUTH-FUNC-008

**Test References**: TC-USER-011, TC-ADMIN-005

---

### REQ-USER-FUNC-010: Admin User Deletion

**Priority**: Medium  
**Category**: Functional  
**Source Feature**: `02-admin-user-crud.feature` - Scenario: "Admin deletes user account"  
**Status**: Implemented

**Requirement Statement**:
WHEN an administrator deletes a user account THEN the system shall remove the user from the database, prevent future logins, and release the email for re-registration.

**Rationale**:
Allows complete removal of obsolete accounts.

**Acceptance Criteria**:
- [ ] User record deleted from database
- [ ] User cannot login after deletion
- [ ] Email becomes available for new registration
- [ ] Associated data handled appropriately (cascade or retain)
- [ ] Deletion logged for audit trail
- [ ] Irreversible action (confirm prompt recommended)

**Dependencies**: REQ-AUTH-RBAC-001

**Test References**: TC-USER-012, TC-ADMIN-006

**Notes**: Consider soft-delete for data retention policies

---

### REQ-USER-FUNC-011: Admin Role Management

**Priority**: High  
**Category**: Functional  
**Source Feature**: `02-admin-user-crud.feature` - Scenarios: "Admin assigns/revokes admin role"  
**Status**: Implemented

**Requirement Statement**:
WHEN an administrator changes a user's role THEN the system shall update the role and apply corresponding permission changes immediately.

**Rationale**:
Enables dynamic role assignment for access control.

**Acceptance Criteria**:
- [ ] Admin can assign "admin" or "user" role
- [ ] Role change effective immediately
- [ ] New permissions apply to subsequent requests
- [ ] Existing sessions reflect role change
- [ ] Role change logged for audit
- [ ] Admin can view user's updated capabilities

**Dependencies**: 
- REQ-AUTH-RBAC-001
- REQ-AUTH-RBAC-005

**Test References**: TC-USER-013, TC-ADMIN-007

---

### REQ-USER-FUNC-012: Admin Self-Protection

**Priority**: Critical  
**Category**: Security  
**Source Feature**: `02-admin-user-crud.feature` - Scenarios: "Admin cannot delete/deactivate their own account"  
**Status**: Implemented

**Requirement Statement**:
The system shall prevent administrators from deleting or deactivating their own account with error message indicating self-modification is not allowed.

**Rationale**:
Prevents accidental lockout of administrative accounts.

**Acceptance Criteria**:
- [ ] Self-deletion attempts rejected
- [ ] Self-deactivation attempts rejected
- [ ] Error message: "Cannot delete your own account"
- [ ] Error message: "Cannot deactivate your own account"
- [ ] Admin account remains fully functional
- [ ] Other admins can modify the account

**Dependencies**: None

**Test References**: TC-USER-014, TC-SEC-014

---

### REQ-USER-FUNC-013: Admin User Detail Viewing

**Priority**: Medium  
**Category**: Functional  
**Source Feature**: `02-admin-user-crud.feature` - Scenarios: "Admin views user details", "Admin can view user's API tokens"  
**Status**: Implemented

**Requirement Statement**:
WHEN an administrator views user details THEN the system shall display all user attributes except password, including API token count and metadata.

**Rationale**:
Provides comprehensive user information for administrative oversight.

**Acceptance Criteria**:
- [ ] Display email, full_name, role, is_active, created_at, ldap_user
- [ ] Password never displayed
- [ ] API token count displayed
- [ ] Token metadata accessible (name, created date, last used)
- [ ] Sensitive token values not displayed
- [ ] All user data visible to admin

**Dependencies**: REQ-AUTH-RBAC-001

**Test References**: TC-USER-015, TC-ADMIN-008

---

### REQ-USER-FUNC-014: Admin Password Reset

**Priority**: High  
**Category**: Functional  
**Source Feature**: `02-admin-user-crud.feature` - Scenario: "Admin can reset user password"  
**Status**: Implemented

**Requirement Statement**:
WHEN an administrator resets a user password THEN the system shall generate a secure temporary password, notify the user, and require password change on first login.

**Rationale**:
Provides password recovery support for users.

**Acceptance Criteria**:
- [ ] Temporary password generated securely
- [ ] Password meets complexity requirements
- [ ] User notified of password reset
- [ ] User can login with temporary password
- [ ] Password change required on first login
- [ ] Temporary password expires after use

**Dependencies**: 
- REQ-AUTH-FUNC-014
- REQ-AUTH-SEC-002

**Test References**: TC-USER-016, TC-ADMIN-009

---

### REQ-USER-FUNC-015: Admin Access Control Enforcement

**Priority**: Critical  
**Category**: Security  
**Source Feature**: `02-admin-user-crud.feature` - Scenarios: Regular user access denial  
**Status**: Implemented

**Requirement Statement**:
The system shall deny all user management operations to non-admin users with HTTP 403 status and error message "Insufficient permissions".

**Rationale**:
Enforces role-based access control for administrative functions.

**Acceptance Criteria**:
- [ ] Regular users cannot list users
- [ ] Regular users cannot create users
- [ ] Regular users cannot update other users
- [ ] Regular users cannot delete users
- [ ] All attempts return HTTP 403
- [ ] Error message consistent across endpoints

**Dependencies**: REQ-AUTH-RBAC-001

**Test References**: TC-USER-017, TC-SEC-015

---

### REQ-USER-SEC-001: Created User Password Security

**Priority**: Critical  
**Category**: Security  
**Source Feature**: `02-admin-user-crud.feature` - Scenario: "Created user password is securely hashed"  
**Status**: Implemented

**Requirement Statement**:
WHEN an administrator creates a user with a password THEN the system shall hash the password using Argon2 and never store or log the plaintext password.

**Rationale**:
Maintains consistent password security for admin-created accounts.

**Acceptance Criteria**:
- [ ] Argon2 hashing applied
- [ ] Plaintext never stored
- [ ] Plaintext never logged
- [ ] Hash verified before first login
- [ ] Same security as self-registered users

**Dependencies**: 
- REQ-AUTH-SEC-001
- REQ-USER-FUNC-007

**Test References**: TC-USER-018, TC-SEC-016

---

### REQ-USER-FUNC-016: Duplicate User Prevention

**Priority**: High  
**Category**: Functional  
**Source Feature**: `02-admin-user-crud.feature` - Scenario: "Admin cannot create user with existing email"  
**Status**: Implemented

**Requirement Statement**:
IF an administrator attempts to create a user with an existing email THEN the system shall reject the operation with error "Email already registered".

**Rationale**:
Maintains email uniqueness across all user creation methods.

**Acceptance Criteria**:
- [ ] Email uniqueness validated
- [ ] Duplicate email rejected
- [ ] Error message clearly indicates reason
- [ ] No partial account creation
- [ ] Validation applies to admin operations

**Dependencies**: REQ-AUTH-FUNC-001

**Test References**: TC-USER-019

---

## 3. User Search and Filtering Requirements

### REQ-USER-FUNC-017: User Search by Email

**Priority**: Medium  
**Category**: Functional  
**Source Feature**: `03-user-search.feature` - Scenarios: "Admin searches users by email", "Admin searches users by partial email"  
**Status**: Implemented

**Requirement Statement**:
WHEN an administrator enters email search criteria THEN the system shall return users whose email contains the search string using case-insensitive partial matching.

**Rationale**:
Enables quick location of users by email address.

**Acceptance Criteria**:
- [ ] Partial email match supported
- [ ] Case-insensitive search
- [ ] Results include all matching users
- [ ] Result count displayed
- [ ] Empty string returns all users
- [ ] Special characters handled correctly

**Dependencies**: REQ-USER-FUNC-006

**Test References**: TC-USER-020

---

### REQ-USER-FUNC-018: User Search by Full Name

**Priority**: Medium  
**Category**: Functional  
**Source Feature**: `03-user-search.feature` - Scenario: "Admin searches users by full name"  
**Status**: Implemented

**Requirement Statement**:
WHEN an administrator enters name search criteria THEN the system shall return users whose full name contains the search string using case-insensitive partial matching.

**Rationale**:
Enables user lookup by name when email is unknown.

**Acceptance Criteria**:
- [ ] Partial name match supported
- [ ] Case-insensitive search
- [ ] First name and last name both searched
- [ ] Results include all matching users
- [ ] Result count displayed

**Dependencies**: REQ-USER-FUNC-006

**Test References**: TC-USER-021

---

### REQ-USER-FUNC-019: User Filtering by Active Status

**Priority**: Medium  
**Category**: Functional  
**Source Feature**: `03-user-search.feature` - Scenarios: "Admin filters users by active/inactive status"  
**Status**: Implemented

**Requirement Statement**:
WHEN an administrator filters by status THEN the system shall return only users matching the selected status (active or inactive).

**Rationale**:
Allows focused review of active or inactive accounts.

**Acceptance Criteria**:
- [ ] Filter by "active" returns is_active = true users only
- [ ] Filter by "inactive" returns is_active = false users only
- [ ] No filter returns all users
- [ ] Filter persists across pagination
- [ ] Result count reflects filtered set

**Dependencies**: REQ-USER-FUNC-006

**Test References**: TC-USER-022

---

### REQ-USER-FUNC-020: User Filtering by Role

**Priority**: Medium  
**Category**: Functional  
**Source Feature**: `03-user-search.feature` - Scenarios: "Admin filters users by role"  
**Status**: Implemented

**Requirement Statement**:
WHEN an administrator filters by role THEN the system shall return only users with the specified role (admin or user).

**Rationale**:
Enables role-specific user management tasks.

**Acceptance Criteria**:
- [ ] Filter by "admin" returns admin users only
- [ ] Filter by "user" returns regular users only
- [ ] No filter returns all users
- [ ] Filter persists across pagination
- [ ] Result count reflects filtered set

**Dependencies**: REQ-USER-FUNC-006

**Test References**: TC-USER-023

---

### REQ-USER-FUNC-021: User Filtering by Authentication Type

**Priority**: Low  
**Category**: Functional  
**Source Feature**: `03-user-search.feature` - Scenarios: "Admin filters LDAP/local users"  
**Status**: Implemented

**Requirement Statement**:
WHEN an administrator filters by authentication type THEN the system shall return only users of the specified type (LDAP or local).

**Rationale**:
Supports authentication-specific administration tasks.

**Acceptance Criteria**:
- [ ] Filter by "LDAP" returns LDAP users only
- [ ] Filter by "local" returns local users only
- [ ] No filter returns all users
- [ ] ldap_user flag determines categorization
- [ ] Filter persists across pagination

**Dependencies**: REQ-USER-FUNC-006

**Test References**: TC-USER-024

---

### REQ-USER-FUNC-022: Combined Search and Filter

**Priority**: Medium  
**Category**: Functional  
**Source Feature**: `03-user-search.feature` - Scenario: "Admin combines search and filter"  
**Status**: Implemented

**Requirement Statement**:
The system shall support simultaneous application of multiple search and filter criteria with AND logic.

**Rationale**:
Enables precise user queries for complex administrative tasks.

**Acceptance Criteria**:
- [ ] Multiple filters applied simultaneously
- [ ] Search and filters combined with AND logic
- [ ] Results match all specified criteria
- [ ] Empty result set handled gracefully
- [ ] All combinations supported

**Dependencies**: 
- REQ-USER-FUNC-017 through REQ-USER-FUNC-021

**Test References**: TC-USER-025

---

### REQ-USER-FUNC-023: Search Results Pagination

**Priority**: High  
**Category**: Functional  
**Source Feature**: `03-user-search.feature` - Scenario: "Search results are paginated"  
**Status**: Implemented

**Requirement Statement**:
WHERE result set exceeds page size, the system shall paginate results with navigation controls allowing administrators to browse pages.

**Rationale**:
Maintains performance and usability with large user counts.

**Acceptance Criteria**:
- [ ] Results limited to page size (default: 20-50)
- [ ] Page size configurable
- [ ] Pagination controls displayed
- [ ] Page number and total pages shown
- [ ] Next/previous navigation available
- [ ] Filters maintained across pages

**Dependencies**: REQ-USER-FUNC-006

**Test References**: TC-USER-026

---

### REQ-USER-FUNC-024: User Sorting

**Priority**: Low  
**Category**: Functional  
**Source Feature**: `03-user-search.feature` - Scenarios: "Admin sorts users by email/name"  
**Status**: Implemented

**Requirement Statement**:
The system shall allow administrators to sort user lists by email or full name in ascending or descending order.

**Rationale**:
Improves data organization and user findability.

**Acceptance Criteria**:
- [ ] Sort by email (ascending/descending)
- [ ] Sort by full name (ascending/descending)
- [ ] Sort indicator visible in UI
- [ ] Sort persists across pagination
- [ ] Default sort order defined

**Dependencies**: REQ-USER-FUNC-006

**Test References**: TC-USER-027

---

### REQ-USER-FUNC-025: Empty Search Results Handling

**Priority**: Low  
**Category**: Functional  
**Source Feature**: `03-user-search.feature` - Scenario: "Search returns no results for non-matching query"  
**Status**: Implemented

**Requirement Statement**:
IF no users match search criteria THEN the system shall display an empty result set with message "No users found".

**Rationale**:
Provides clear feedback when searches return no matches.

**Acceptance Criteria**:
- [ ] Empty result set handled gracefully
- [ ] Message "No users found" displayed
- [ ] No error thrown for zero results
- [ ] Search criteria remain visible
- [ ] User can clear filters

**Dependencies**: None

**Test References**: TC-USER-028

---

### REQ-USER-FUNC-026: Filter Reset

**Priority**: Low  
**Category**: Functional  
**Source Feature**: `03-user-search.feature` - Scenario: "Admin clears search filters"  
**Status**: Implemented

**Requirement Statement**:
WHEN an administrator clears filters THEN the system shall remove all search and filter criteria and display all users.

**Rationale**:
Provides easy return to full user list view.

**Acceptance Criteria**:
- [ ] Clear button removes all filters
- [ ] All users displayed after clear
- [ ] Result count returns to total
- [ ] UI state reset to defaults
- [ ] Single action clears all filters

**Dependencies**: REQ-USER-FUNC-006

**Test References**: TC-USER-029

---

### REQ-USER-FUNC-027: Search Access Control

**Priority**: Critical  
**Category**: Security  
**Source Feature**: `03-user-search.feature` - Scenario: "Regular user cannot search users"  
**Status**: Implemented

**Requirement Statement**:
The system shall deny user search and filtering operations to non-admin users with HTTP 403 status.

**Rationale**:
Prevents unauthorized access to user directory information.

**Acceptance Criteria**:
- [ ] Regular users cannot access search endpoint
- [ ] HTTP 403 returned for non-admins
- [ ] Error message indicates insufficient permissions
- [ ] No user data leaked in error
- [ ] Admin-only access enforced

**Dependencies**: REQ-AUTH-RBAC-001

**Test References**: TC-USER-030, TC-SEC-017

---

## Summary

### Requirements by Category
- **Functional**: 23 requirements
- **Security**: 5 requirements
- **UI**: 1 requirement

**Total**: 29 requirements

### Requirements by Priority
- **Critical**: 6 requirements
- **High**: 10 requirements
- **Medium**: 9 requirements
- **Low**: 4 requirements

### Coverage
- **Feature Files**: 3
- **Scenarios**: 45
- **Test Cases**: 30+ (referenced)

### Key Features
- Profile self-management with access control
- Comprehensive admin CRUD operations
- Advanced search and filtering capabilities
- LDAP user handling and restrictions
- Role-based permission enforcement

---

**Document Status**: Complete  
**Review Status**: Pending stakeholder review  
**Next Review**: TBD
