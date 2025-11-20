# REQ-004: Personal Access Token Requirements

**Module**: Personal Access Tokens (PAT)  
**Version**: 1.0  
**Last Updated**: 2025-11-01  
**Status**: Active

## Overview
This document specifies the requirements for Personal Access Token functionality, including token creation, management, authentication, and scope-based authorization.

## Source Documents
- `features/personal-access-tokens/01-token-creation.feature`
- `features/personal-access-tokens/02-token-management.feature`
- `features/personal-access-tokens/03-token-authentication.feature`

---

## 1. Token Creation Requirements

### REQ-PAT-FUNC-001: PAT Creation with Name and Scope

**Priority**: Critical  
**Category**: Functional  
**Source**: 01-token-creation.feature (Scenario: User creates PAT with read scope)

**Requirement Statement**:  
WHEN a logged-in user creates a PAT with name, scope, and expiration period, THEN the system shall generate a unique token, display it once, and store the hashed value.

**Rationale**:  
Users need API tokens for programmatic access while maintaining security through one-time display and hashed storage.

**Acceptance Criteria**:
- [x] Token is generated with cryptographically secure random value
- [x] Token value is displayed exactly once
- [x] Token is hashed using secure algorithm before storage
- [x] Name, scope, and expiration are stored with token
- [x] Success message confirms creation

**Dependencies**: REQ-AUTH-FUNC-005 (User authentication)

**Test Cases**: Scenario "User creates PAT with read scope"

---

### REQ-PAT-FUNC-002: Token Scope Validation

**Priority**: Critical  
**Category**: Functional  
**Source**: 01-token-creation.feature (Multiple scenarios)

**Requirement Statement**:  
The system shall validate that token scope is one of allowed values (read, write, admin) and enforce that regular users cannot create admin-scoped tokens.

**Rationale**:  
Scope controls define authorization levels and must be strictly validated to prevent privilege escalation.

**Acceptance Criteria**:
- [x] Valid scopes are: read, write, admin
- [x] Regular users can create read and write scopes
- [x] Only admins can create admin scope tokens
- [x] Invalid scopes are rejected with error "Invalid scope"
- [x] Insufficient permissions error for admin scope creation by non-admin

**Dependencies**: REQ-AUTH-FUNC-015 (Admin role check)

**Test Cases**: Scenarios "User creates PAT with write scope", "Regular user cannot create PAT with admin scope"

---

### REQ-PAT-FUNC-003: Token Name Requirement

**Priority**: High  
**Category**: Functional  
**Source**: 01-token-creation.feature (Scenario: PAT creation fails without name)

**Requirement Statement**:  
The system shall require a non-empty name for token creation and reject creation requests without a name with error "Token name is required".

**Rationale**:  
Names help users identify and manage multiple tokens.

**Acceptance Criteria**:
- [x] Name field is mandatory
- [x] Empty or null names are rejected
- [x] Error message is clear
- [x] No token is created on validation failure

**Dependencies**: None

**Test Cases**: Scenario "PAT creation fails without name"

---

### REQ-PAT-FUNC-004: Token Name Uniqueness

**Priority**: High  
**Category**: Functional  
**Source**: 01-token-creation.feature (Scenario: PAT creation fails with duplicate name)

**Requirement Statement**:  
The system shall enforce unique token names per user and reject creation of tokens with duplicate names with error "Token name already exists".

**Rationale**:  
Unique names prevent confusion and ensure tokens can be uniquely identified.

**Acceptance Criteria**:
- [x] Token name uniqueness is scoped to user
- [x] Different users can have same token name
- [x] Duplicate name creation is rejected
- [x] Case-sensitive or case-insensitive comparison (specify)

**Dependencies**: None

**Test Cases**: Scenario "PAT creation fails with duplicate name"

---

### REQ-PAT-FUNC-005: Token Expiration Configuration

**Priority**: High  
**Category**: Functional  
**Source**: 01-token-creation.feature (Scenarios: Custom expiration, no expiration)

**Requirement Statement**:  
The system shall allow users to specify token expiration in days or create non-expiring tokens, and display appropriate warnings for non-expiring tokens.

**Rationale**:  
Expiration limits security risk of compromised tokens.

**Acceptance Criteria**:
- [x] Users can specify expiration in days
- [x] Users can create non-expiring tokens
- [x] Expiration date is calculated from creation time
- [x] Non-expiring tokens show "Never expires"
- [x] Security warning displayed for non-expiring tokens
- [x] Negative expiration values rejected

**Dependencies**: None

**Test Cases**: Scenarios "User creates PAT with custom expiration", "User creates PAT with no expiration"

---

### REQ-PAT-SEC-001: Token One-Time Display

**Priority**: Critical  
**Category**: Security  
**Source**: 01-token-creation.feature (Scenario: Token value is displayed only once after creation)

**Requirement Statement**:  
WHEN a token is created, THEN the system shall display the full token value exactly once with a warning "Save this token now - it won't be shown again" and never display the full value again.

**Rationale**:  
One-time display minimizes token exposure and forces secure storage by users.

**Acceptance Criteria**:
- [x] Full token displayed only on creation page
- [x] Warning message is prominent
- [x] Copy-to-clipboard functionality provided
- [x] Full token cannot be retrieved later
- [x] Only token prefix shown in subsequent views

**Dependencies**: REQ-PAT-UI-001

**Test Cases**: Scenarios "Token value is displayed only once after creation", "Token value is never shown again after initial creation"

---

### REQ-PAT-SEC-002: Token Secure Hashing

**Priority**: Critical  
**Category**: Security  
**Source**: 01-token-creation.feature (Scenario: Created PAT is securely hashed in database)

**Requirement Statement**:  
The system shall hash token values using a cryptographically secure algorithm before database storage and never store plaintext tokens.

**Rationale**:  
Hashing protects tokens if database is compromised.

**Acceptance Criteria**:
- [x] Token hashed using bcrypt or similar
- [x] Only hash stored in database
- [x] Plaintext token never persisted
- [x] Token verification uses hash comparison
- [x] Salt is unique per token

**Dependencies**: None

**Test Cases**: Scenario "Created PAT is securely hashed in database"

---

### REQ-PAT-UI-001: Token Copy to Clipboard

**Priority**: Medium  
**Category**: User Interface  
**Source**: 01-token-creation.feature (Scenario: User can copy token to clipboard)

**Requirement Statement**:  
WHEN the token creation page displays the token value, THEN the system shall provide a copy-to-clipboard button that copies the token and displays a confirmation.

**Rationale**:  
Easy copying reduces user error in saving tokens.

**Acceptance Criteria**:
- [x] Copy button is prominently displayed
- [x] Button copies full token value to clipboard
- [x] Confirmation message shown on copy
- [x] Works across modern browsers

**Dependencies**: REQ-PAT-SEC-001

**Test Cases**: Scenario "User can copy token to clipboard"

---

### REQ-PAT-FUNC-006: Multiple Token Support

**Priority**: High  
**Category**: Functional  
**Source**: 01-token-creation.feature (Scenario: User can create multiple PATs)

**Requirement Statement**:  
The system shall allow users to create multiple tokens with unique names and values, with each token independently manageable.

**Rationale**:  
Users need multiple tokens for different applications or purposes.

**Acceptance Criteria**:
- [x] No limit on number of tokens per user (or specify limit)
- [x] Each token has unique cryptographic value
- [x] Tokens can have different scopes and expirations
- [x] All tokens appear in token list

**Dependencies**: REQ-PAT-FUNC-004

**Test Cases**: Scenario "User can create multiple PATs"

---

### REQ-PAT-FUNC-007: Token Metadata Storage

**Priority**: Medium  
**Category**: Functional  
**Source**: 01-token-creation.feature (Scenario: Token creation updates last activity timestamp)

**Requirement Statement**:  
WHEN a token is created, THEN the system shall store creation timestamp, last used timestamp (initially "Never"), name, scope, expiration, and owner.

**Rationale**:  
Metadata enables token management and security monitoring.

**Acceptance Criteria**:
- [x] created_at timestamp stored
- [x] last_used initialized to null/"Never"
- [x] Token prefix stored for display
- [x] User ID/email stored as owner
- [x] Expiration date stored

**Dependencies**: None

**Test Cases**: Scenario "Token creation updates last activity timestamp"

---

### REQ-PAT-SEC-003: Token Information Minimization

**Priority**: High  
**Category**: Security  
**Source**: 01-token-creation.feature (Scenario: Token includes only necessary information)

**Requirement Statement**:  
The system shall ensure tokens contain only necessary information (user_id, scope, expiration) and exclude sensitive user details.

**Rationale**:  
Minimizing token content reduces information disclosure if token is compromised.

**Acceptance Criteria**:
- [x] Token structure is documented
- [x] User ID included for authentication
- [x] Scope included for authorization
- [x] Expiration included if applicable
- [x] PII excluded from token structure

**Dependencies**: None

**Test Cases**: Scenario "Token includes only necessary information"

---

## 2. Token Management Requirements

### REQ-PAT-FUNC-008: Token List Retrieval

**Priority**: Critical  
**Category**: Functional  
**Source**: 02-token-management.feature (Scenario: User views list of their active tokens)

**Requirement Statement**:  
WHEN a user requests their token list, THEN the system shall return only active tokens owned by that user by default, excluding revoked tokens.

**Rationale**:  
Users need to view and manage their tokens.

**Acceptance Criteria**:
- [x] Only user's own tokens returned
- [x] Active tokens shown by default
- [x] Revoked tokens hidden by default
- [x] Expired tokens included with status indicator

**Dependencies**: REQ-ITEM-SEC-001 (Ownership enforcement pattern)

**Test Cases**: Scenario "User views list of their active tokens"

---

### REQ-PAT-FUNC-009: Token Metadata Display

**Priority**: High  
**Category**: Functional  
**Source**: 02-token-management.feature (Scenario: Token list shows metadata)

**Requirement Statement**:  
WHEN displaying token list, THEN the system shall show name, scope, created_at, expires_at, last_used, and token_prefix for each token without displaying the full token value.

**Rationale**:  
Users need sufficient information to identify and manage tokens without security risks.

**Acceptance Criteria**:
- [x] All specified fields displayed
- [x] Full token value never shown
- [x] Token prefix helps identification
- [x] Timestamps formatted for readability
- [x] Status indicators clear

**Dependencies**: REQ-PAT-SEC-001

**Test Cases**: Scenario "Token list shows metadata"

---

### REQ-PAT-FUNC-010: Token Revocation

**Priority**: Critical  
**Category**: Functional  
**Source**: 02-token-management.feature (Scenario: User revokes an active token)

**Requirement Statement**:  
WHEN a user confirms revocation of a token, THEN the system shall immediately invalidate the token, prevent future authentication, and display success message "Token revoked".

**Rationale**:  
Users must be able to invalidate compromised or unused tokens.

**Acceptance Criteria**:
- [x] Revocation requires confirmation
- [x] Token marked as revoked immediately
- [x] Future authentication with token fails
- [x] Token removed from active list
- [x] Revocation is irreversible

**Dependencies**: REQ-PAT-UI-002

**Test Cases**: Scenario "User revokes an active token"

---

### REQ-PAT-SEC-004: Immediate Token Invalidation

**Priority**: Critical  
**Category**: Security  
**Source**: 02-token-management.feature (Scenario: Token revocation is immediate)

**Requirement Statement**:  
WHEN a token is revoked, THEN the system shall invalidate it immediately with no grace period, causing in-flight requests to fail.

**Rationale**:  
Immediate invalidation minimizes window for compromised token use.

**Acceptance Criteria**:
- [x] Revocation is atomic operation
- [x] No grace period exists
- [x] In-flight requests fail authentication
- [x] Revocation timestamp recorded

**Dependencies**: REQ-PAT-FUNC-010

**Test Cases**: Scenario "Token revocation is immediate"

---

### REQ-PAT-FUNC-011: Revoked Token Authentication Failure

**Priority**: Critical  
**Category**: Functional  
**Source**: 02-token-management.feature (Scenario: Revoked token cannot authenticate)

**Requirement Statement**:  
WHEN an API request uses a revoked token, THEN the system shall reject authentication with status 401 and error "Invalid or revoked token".

**Rationale**:  
Revoked tokens must not provide access.

**Acceptance Criteria**:
- [x] Authentication fails with 401 status
- [x] Error message is clear
- [x] Access to protected resources denied
- [x] Revocation status checked on every request

**Dependencies**: REQ-PAT-FUNC-006 (PAT authentication)

**Test Cases**: Scenario "Revoked token cannot authenticate"

---

### REQ-PAT-FUNC-012: Revoked Token Filtering

**Priority**: Medium  
**Category**: Functional  
**Source**: 02-token-management.feature (Scenario: User views revoked tokens)

**Requirement Statement**:  
The system shall allow users to filter their token list to show revoked tokens with revocation timestamp displayed.

**Rationale**:  
Users need to review revoked tokens for audit purposes.

**Acceptance Criteria**:
- [x] Filter option to show revoked tokens
- [x] Revoked tokens show status "revoked"
- [x] Revocation timestamp displayed
- [x] Can switch between active and revoked views

**Dependencies**: REQ-PAT-FUNC-008

**Test Cases**: Scenario "User views revoked tokens"

---

### REQ-PAT-FUNC-013: Expired Token Identification

**Priority**: High  
**Category**: Functional  
**Source**: 02-token-management.feature (Scenario: User identifies expired tokens)

**Requirement Statement**:  
WHEN a token's expiration date has passed, THEN the system shall display the token with status "expired" and appropriate visual indicators.

**Rationale**:  
Users need to identify expired tokens for cleanup or renewal.

**Acceptance Criteria**:
- [x] Expired status calculated from expiration date
- [x] Status displayed as "expired"
- [x] Visual indicator (icon/color) shown
- [x] Warning message about expiration

**Dependencies**: REQ-PAT-FUNC-005

**Test Cases**: Scenario "User identifies expired tokens"

---

### REQ-PAT-FUNC-014: Expiring Token Warning

**Priority**: Medium  
**Category**: Functional  
**Source**: 02-token-management.feature (Scenario: User sees warning for expiring tokens)

**Requirement Statement**:  
WHEN a token will expire within 7 days, THEN the system shall display an expiration warning "Expires soon" with highlighted expiration date.

**Rationale**:  
Proactive warnings help users renew tokens before expiration.

**Acceptance Criteria**:
- [x] Warning shown for tokens expiring in ≤7 days
- [x] Warning message is clear
- [x] Expiration date highlighted
- [x] Warning dismissed after renewal

**Dependencies**: REQ-PAT-FUNC-013

**Test Cases**: Scenario "User sees warning for expiring tokens"

---

### REQ-PAT-FUNC-015: Token Last Used Tracking

**Priority**: Medium  
**Category**: Functional  
**Source**: 02-token-management.feature (Scenarios: Token list shows last used timestamp)

**Requirement Statement**:  
The system shall track and display the timestamp when each token was last used for authentication, showing "Never" for unused tokens.

**Rationale**:  
Last used tracking helps identify unused or suspicious token activity.

**Acceptance Criteria**:
- [x] last_used updated on each authentication
- [x] Timestamp displayed in token list
- [x] "Never" shown for unused tokens
- [x] Helps identify inactive tokens

**Dependencies**: REQ-PAT-FUNC-006 (Authentication updates timestamp)

**Test Cases**: Scenarios "Token list shows last used timestamp", "Token list shows unused tokens"

---

### REQ-PAT-FUNC-016: Token Scope Filtering

**Priority**: Low  
**Category**: Functional  
**Source**: 02-token-management.feature (Scenario: User filters tokens by scope)

**Requirement Statement**:  
The system shall allow users to filter their token list by scope value (read, write, admin).

**Rationale**:  
Scope filtering helps users manage tokens by authorization level.

**Acceptance Criteria**:
- [x] Filter by read, write, or admin scope
- [x] Only matching tokens displayed
- [x] Can clear filter to show all
- [x] Filter preserves other display settings

**Dependencies**: REQ-PAT-FUNC-008

**Test Cases**: Scenario "User filters tokens by scope"

---

### REQ-PAT-FUNC-017: Token List Sorting

**Priority**: Low  
**Category**: Functional  
**Source**: 02-token-management.feature (Scenario: Token list is sorted by creation date)

**Requirement Statement**:  
The system shall sort token list by creation date in descending order by default, showing most recently created tokens first.

**Rationale**:  
Chronological sorting helps users find recent tokens.

**Acceptance Criteria**:
- [x] Default sort is by created_at descending
- [x] Newest tokens appear first
- [x] Sort order is consistent
- [x] Optional: User can change sort order

**Dependencies**: REQ-PAT-FUNC-008

**Test Cases**: Scenario "Token list is sorted by creation date"

---

### REQ-PAT-FUNC-018: Token Renaming

**Priority**: Medium  
**Category**: Functional  
**Source**: 02-token-management.feature (Scenario: User can rename a token)

**Requirement Statement**:  
The system shall allow users to rename tokens while preserving the token value and enforcing name uniqueness.

**Rationale**:  
Renaming supports evolving token purposes without recreation.

**Acceptance Criteria**:
- [x] User can update token name
- [x] Token value unchanged
- [x] New name must be unique (per user)
- [x] Rename fails if name exists

**Dependencies**: REQ-PAT-FUNC-004

**Test Cases**: Scenarios "User can rename a token", "User cannot rename token to existing name"

---

### REQ-PAT-UI-002: Token Revocation Confirmation

**Priority**: High  
**Category**: User Interface  
**Source**: 02-token-management.feature (Scenario: User receives confirmation before revoking token)

**Requirement Statement**:  
WHEN a user initiates token revocation, THEN the system shall display a confirmation dialog warning "This action cannot be undone" and require explicit confirmation.

**Rationale**:  
Confirmation prevents accidental token revocation.

**Acceptance Criteria**:
- [x] Confirmation dialog displayed
- [x] Warning is clear
- [x] User must explicitly confirm
- [x] User can cancel operation

**Dependencies**: REQ-PAT-FUNC-010

**Test Cases**: Scenario "User receives confirmation before revoking token"

---

### REQ-PAT-FUNC-019: Token Revocation Cancellation

**Priority**: Medium  
**Category**: Functional  
**Source**: 02-token-management.feature (Scenario: Token revocation can be cancelled)

**Requirement Statement**:  
WHEN a user cancels the revocation confirmation dialog, THEN the system shall abort the revocation and the token shall remain active.

**Rationale**:  
Users need ability to cancel accidental revocation initiations.

**Acceptance Criteria**:
- [x] Cancel button available in dialog
- [x] Canceling aborts revocation
- [x] Token remains active
- [x] No changes made

**Dependencies**: REQ-PAT-UI-002

**Test Cases**: Scenario "Token revocation can be cancelled"

---

### REQ-PAT-SEC-005: Token Ownership Isolation

**Priority**: Critical  
**Category**: Security  
**Source**: 02-token-management.feature (Scenarios: User cannot view/revoke another user's tokens)

**Requirement Statement**:  
The system shall enforce that users can only view, modify, and revoke their own tokens, with access denied for other users' tokens.

**Rationale**:  
Token isolation is critical for multi-tenant security.

**Acceptance Criteria**:
- [x] All token queries filter by owner
- [x] Unauthorized access returns 403 or 404
- [x] No information about other users' tokens leaked
- [x] Applies to all token management operations

**Dependencies**: REQ-ITEM-SEC-001 (Ownership pattern)

**Test Cases**: Scenarios "User cannot view another user's tokens", "User cannot revoke another user's tokens"

---

### REQ-PAT-UI-003: Token Prefix Display

**Priority**: Medium  
**Category**: User Interface  
**Source**: 02-token-management.feature (Scenario: Token prefix provides identification without exposure)

**Requirement Statement**:  
WHEN displaying token list, THEN the system shall show a token prefix (e.g., "demo_123...") to help identification while masking remaining characters.

**Rationale**:  
Prefix balances token identification with security.

**Acceptance Criteria**:
- [x] Prefix is meaningful (e.g., first 8-10 chars)
- [x] Remaining characters masked
- [x] Prefix helps identify tokens
- [x] Full value never reconstructible from prefix

**Dependencies**: REQ-PAT-SEC-001

**Test Cases**: Scenario "Token prefix provides identification without exposure"

---

## 3. Token Authentication Requirements

### REQ-PAT-FUNC-020: Valid Token Authentication

**Priority**: Critical  
**Category**: Functional  
**Source**: 03-token-authentication.feature (Scenario: API request authenticates with valid PAT)

**Requirement Statement**:  
WHEN an API request includes a valid, non-expired, non-revoked PAT, THEN the system shall authenticate the request and identify the user from the token.

**Rationale**:  
PAT authentication enables programmatic API access.

**Acceptance Criteria**:
- [x] Token validated against stored hash
- [x] Expiration checked
- [x] Revocation status checked
- [x] User identified from token
- [x] Request proceeds as authenticated

**Dependencies**: REQ-PAT-SEC-002

**Test Cases**: Scenario "API request authenticates with valid PAT"

---

### REQ-PAT-FUNC-021: Invalid Token Rejection

**Priority**: Critical  
**Category**: Functional  
**Source**: 03-token-authentication.feature (Scenario: API request fails with invalid PAT)

**Requirement Statement**:  
WHEN an API request includes an invalid or unrecognized token, THEN the system shall reject authentication with status 401 and error "Invalid or revoked token".

**Rationale**:  
Invalid tokens must not provide access.

**Acceptance Criteria**:
- [x] Unrecognized tokens rejected
- [x] Malformed tokens rejected
- [x] 401 status returned
- [x] Error message does not reveal system details

**Dependencies**: None

**Test Cases**: Scenario "API request fails with invalid PAT"

---

### REQ-PAT-FUNC-022: Expired Token Rejection

**Priority**: Critical  
**Category**: Functional  
**Source**: 03-token-authentication.feature (Scenario: API request fails with expired PAT)

**Requirement Statement**:  
WHEN an API request includes an expired token, THEN the system shall reject authentication with status 401 and error "Token has expired".

**Rationale**:  
Expired tokens must not provide access.

**Acceptance Criteria**:
- [x] Expiration checked on every request
- [x] Expired tokens rejected immediately
- [x] Clear error message about expiration
- [x] 401 status returned

**Dependencies**: REQ-PAT-FUNC-005

**Test Cases**: Scenario "API request fails with expired PAT"

---

### REQ-PAT-FUNC-023: Revoked Token Rejection

**Priority**: Critical  
**Category**: Functional  
**Source**: 03-token-authentication.feature (Scenario: API request fails with revoked PAT)

**Requirement Statement**:  
WHEN an API request includes a revoked token, THEN the system shall reject authentication with status 401 and error "Invalid or revoked token".

**Rationale**:  
Revoked tokens must not provide access.

**Acceptance Criteria**:
- [x] Revocation status checked on every request
- [x] Revoked tokens rejected
- [x] Error message same as invalid token
- [x] No indication of revocation vs invalid

**Dependencies**: REQ-PAT-FUNC-010

**Test Cases**: Scenario "API request fails with revoked PAT"

---

### REQ-PAT-FUNC-024: Read Scope Authorization

**Priority**: Critical  
**Category**: Functional  
**Source**: 03-token-authentication.feature (Scenarios: Read-scoped token access)

**Requirement Statement**:  
WHEN an API request is authenticated with a read-scoped token, THEN the system shall allow GET requests and reject POST/PUT/DELETE requests with status 403 and error "Insufficient permissions".

**Rationale**:  
Read scope limits token to read-only operations.

**Acceptance Criteria**:
- [x] GET requests succeed
- [x] POST/PUT/DELETE requests fail with 403
- [x] Error message indicates insufficient permissions
- [x] Scope checked after authentication

**Dependencies**: REQ-PAT-FUNC-002

**Test Cases**: Scenarios "Read-scoped token can access read-only endpoints", "Read-scoped token cannot access write endpoints"

---

### REQ-PAT-FUNC-025: Write Scope Authorization

**Priority**: Critical  
**Category**: Functional  
**Source**: 03-token-authentication.feature (Scenarios: Write-scoped token access)

**Requirement Statement**:  
WHEN an API request is authenticated with a write-scoped token, THEN the system shall allow GET, POST, PUT, and DELETE requests to user resources but reject admin endpoints with status 403.

**Rationale**:  
Write scope includes read permissions plus modification rights.

**Acceptance Criteria**:
- [x] All CRUD operations on user resources succeed
- [x] Admin endpoints return 403
- [x] Write includes read permissions
- [x] Ownership rules still enforced

**Dependencies**: REQ-PAT-FUNC-002

**Test Cases**: Scenarios "Write-scoped token can access read endpoints", "Write-scoped token can access write endpoints", "Write-scoped token cannot access admin endpoints"

---

### REQ-PAT-FUNC-026: Admin Scope Authorization

**Priority**: Critical  
**Category**: Functional  
**Source**: 03-token-authentication.feature (Scenario: Admin-scoped token can access all endpoints)

**Requirement Statement**:  
WHEN an API request is authenticated with an admin-scoped token from an admin user, THEN the system shall grant full access to all endpoints including user management.

**Rationale**:  
Admin scope provides full API access for administrative operations.

**Acceptance Criteria**:
- [x] All endpoints accessible
- [x] Admin-scoped token requires admin user
- [x] Full CRUD on all resources
- [x] Can manage other users

**Dependencies**: REQ-PAT-FUNC-002, REQ-AUTH-FUNC-015

**Test Cases**: Scenario "Admin-scoped token can access all endpoints"

---

### REQ-PAT-SEC-006: Admin Scope Restriction

**Priority**: Critical  
**Category**: Security  
**Source**: 03-token-authentication.feature (Scenario: Regular user token with admin scope is rejected)

**Requirement Statement**:  
The system shall reject any admin-scoped token that was not created by an admin user, preventing privilege escalation through token manipulation.

**Rationale**:  
Admin scope must be tied to admin user status at creation time.

**Acceptance Criteria**:
- [x] Admin scope creation restricted to admins
- [x] Manually crafted admin tokens rejected
- [x] Token scope validated against user role
- [x] No privilege escalation possible

**Dependencies**: REQ-PAT-FUNC-002

**Test Cases**: Scenario "Regular user token with admin scope is rejected"

---

### REQ-PAT-FUNC-027: Token Last Used Update

**Priority**: Medium  
**Category**: Functional  
**Source**: 03-token-authentication.feature (Scenario: Token last used timestamp is updated)

**Requirement Statement**:  
WHEN a token successfully authenticates an API request, THEN the system shall update the token's last_used timestamp to the current time.

**Rationale**:  
Tracking usage helps identify inactive or compromised tokens.

**Acceptance Criteria**:
- [x] last_used updated on successful authentication
- [x] Timestamp reflects request time
- [x] Update is asynchronous to avoid blocking request
- [x] Failed authentication does not update timestamp

**Dependencies**: REQ-PAT-FUNC-015

**Test Cases**: Scenario "Token last used timestamp is updated"

---

### REQ-PAT-SEC-007: Token Case Sensitivity

**Priority**: High  
**Category**: Security  
**Source**: 03-token-authentication.feature (Scenario: Token authentication is case-sensitive)

**Requirement Statement**:  
The system shall treat token values as case-sensitive and reject tokens with incorrect case.

**Rationale**:  
Case sensitivity increases token entropy and security.

**Acceptance Criteria**:
- [x] Token comparison is case-sensitive
- [x] Incorrect case causes authentication failure
- [x] No case normalization performed
- [x] Token generation uses mixed case

**Dependencies**: None

**Test Cases**: Scenario "Token authentication is case-sensitive"

---

### REQ-PAT-FUNC-028: Token Reusability

**Priority**: High  
**Category**: Functional  
**Source**: 03-token-authentication.feature (Scenario: Multiple requests with same token succeed)

**Requirement Statement**:  
The system shall allow unlimited authentication requests with the same valid token, subject to rate limiting if configured.

**Rationale**:  
Tokens are designed for repeated use until revoked or expired.

**Acceptance Criteria**:
- [x] Same token can authenticate multiple requests
- [x] No token "consumption" or one-time use
- [x] Rate limiting applied if configured
- [x] Token remains valid after use

**Dependencies**: None

**Test Cases**: Scenario "Multiple requests with same token succeed"

---

### REQ-PAT-FUNC-029: Authorization Header Support

**Priority**: Critical  
**Category**: Functional  
**Source**: 03-token-authentication.feature (Scenario: Token authentication via Authorization header)

**Requirement Statement**:  
The system shall accept tokens in the Authorization header using the Bearer scheme format "Authorization: Bearer {token}".

**Rationale**:  
Standard Bearer token format is widely supported by API clients.

**Acceptance Criteria**:
- [x] Authorization header parsed
- [x] Bearer scheme recognized
- [x] Token extracted from header value
- [x] Authentication proceeds normally

**Dependencies**: REQ-PAT-FUNC-020

**Test Cases**: Scenario "Token authentication via Authorization header"

---

### REQ-PAT-FUNC-030: Custom Header Support

**Priority**: High  
**Category**: Functional  
**Source**: 03-token-authentication.feature (Scenario: Token authentication via custom header)

**Requirement Statement**:  
The system shall accept tokens in a custom X-API-Key header as an alternative to the Authorization header.

**Rationale**:  
Custom header provides flexibility for different client implementations.

**Acceptance Criteria**:
- [x] X-API-Key header parsed
- [x] Token extracted directly from header value
- [x] Authentication proceeds normally
- [x] Both header methods work equivalently

**Dependencies**: REQ-PAT-FUNC-020

**Test Cases**: Scenario "Token authentication via custom header"

---

### REQ-PAT-FUNC-031: Unauthenticated Request Rejection

**Priority**: Critical  
**Category**: Functional  
**Source**: 03-token-authentication.feature (Scenario: Request fails without authentication)

**Requirement Statement**:  
WHEN an API request to a protected endpoint includes neither token nor session credentials, THEN the system shall reject the request with status 401 and error "Not authenticated".

**Rationale**:  
Protected endpoints require authentication.

**Acceptance Criteria**:
- [x] Requests without credentials rejected
- [x] 401 status returned
- [x] Error message is clear
- [x] Access to resources denied

**Dependencies**: None

**Test Cases**: Scenario "Request fails without authentication"

---

### REQ-PAT-SEC-008: Token Ownership Enforcement

**Priority**: Critical  
**Category**: Security  
**Source**: 03-token-authentication.feature (Scenario: Token from different user cannot access resources)

**Requirement Statement**:  
WHEN an API request is authenticated with a token, THEN the system shall enforce ownership rules preventing access to other users' resources.

**Rationale**:  
Token authentication must respect the same ownership rules as session authentication.

**Acceptance Criteria**:
- [x] Token identifies user owner
- [x] Ownership rules enforced
- [x] Cannot access other users' resources
- [x] Same authorization as session auth

**Dependencies**: REQ-ITEM-SEC-001, REQ-PAT-FUNC-020

**Test Cases**: Scenario "Token from different user cannot access resources"

---

### REQ-PAT-FUNC-032: Immediate Token Activation

**Priority**: High  
**Category**: Functional  
**Source**: 03-token-authentication.feature (Scenario: Token works immediately after creation)

**Requirement Statement**:  
WHEN a token is created, THEN the system shall make it immediately available for authentication with no activation delay.

**Rationale**:  
Users expect tokens to work immediately after creation.

**Acceptance Criteria**:
- [x] Token usable immediately after creation
- [x] No propagation delay
- [x] No activation step required
- [x] Works on first use

**Dependencies**: REQ-PAT-FUNC-001

**Test Cases**: Scenario "Token works immediately after creation"

---

### REQ-PAT-FUNC-033: Scope-Based Authorization Matrix

**Priority**: Critical  
**Category**: Functional  
**Source**: 03-token-authentication.feature (Scenario Outline: Scope-based authorization matrix)

**Requirement Statement**:  
The system shall enforce the following authorization matrix based on token scope and HTTP method:
- read scope: GET only
- write scope: GET, POST, PUT, DELETE (non-admin endpoints)
- admin scope: all methods on all endpoints

**Rationale**:  
Scope-based authorization provides granular access control.

**Acceptance Criteria**:
- [x] Authorization matrix enforced consistently
- [x] Each scope/method combination produces expected result
- [x] Admin endpoints restricted to admin scope
- [x] Clear 403 error for insufficient permissions

**Dependencies**: REQ-PAT-FUNC-024, REQ-PAT-FUNC-025, REQ-PAT-FUNC-026

**Test Cases**: Scenario Outline "Scope-based authorization matrix"

---

### REQ-PAT-SEC-009: Token Authentication Logging

**Priority**: Medium  
**Category**: Security  
**Source**: 03-token-authentication.feature (Scenario: Token authentication logs activity)

**Requirement Statement**:  
WHEN an API request is authenticated with a token, THEN the system shall log the authentication attempt including timestamp, user, endpoint, and result, without logging the token value.

**Rationale**:  
Authentication logging supports security monitoring and audit.

**Acceptance Criteria**:
- [x] Successful authentications logged
- [x] Failed authentications logged
- [x] Token value excluded from logs
- [x] Sufficient information for audit

**Dependencies**: None

**Test Cases**: Scenario "Token authentication logs activity"

---

### REQ-PAT-FUNC-034: Cross-Client Compatibility

**Priority**: High  
**Category**: Functional  
**Source**: 03-token-authentication.feature (Scenario: Token authentication works across different clients)

**Requirement Statement**:  
The system shall ensure token authentication works consistently across different HTTP clients including HTTPie, curl, Postman, Python requests, and JavaScript fetch.

**Rationale**:  
Tokens must work with standard HTTP protocols and common clients.

**Acceptance Criteria**:
- [x] Standard HTTP headers used
- [x] No client-specific requirements
- [x] Works with all common HTTP clients
- [x] Behavior is consistent

**Dependencies**: REQ-PAT-FUNC-029, REQ-PAT-FUNC-030

**Test Cases**: Scenario "Token authentication works across different clients"

---

## 4. Admin Token Management Requirements

### REQ-PAT-FUNC-035: Admin View User Token Counts

**Priority**: Medium  
**Category**: Functional  
**Source**: 02-token-management.feature (Scenario: Admin can view all users' token counts)

**Requirement Statement**:  
WHEN an admin views the user list, THEN the system shall display each user's active token count to help identify users with many tokens.

**Rationale**:  
Admins need visibility into token usage patterns.

**Acceptance Criteria**:
- [x] Token count shown per user
- [x] Count includes only active tokens
- [x] Admin can sort by token count
- [x] Helps identify unusual patterns

**Dependencies**: REQ-AUTH-FUNC-015

**Test Cases**: Scenario "Admin can view all users' token counts"

---

### REQ-PAT-FUNC-036: Admin Revoke User Tokens

**Priority**: High  
**Category**: Functional  
**Source**: 02-token-management.feature (Scenario: Admin can revoke any user's tokens)

**Requirement Statement**:  
WHEN an admin revokes a user's token, THEN the system shall invalidate the token immediately and prevent the user from using it further.

**Rationale**:  
Admins need ability to revoke compromised or problematic tokens.

**Acceptance Criteria**:
- [x] Admin can revoke any user's token
- [x] Token invalidated immediately
- [x] User notified (optional)
- [x] Audit log records admin action

**Dependencies**: REQ-AUTH-FUNC-015, REQ-PAT-FUNC-010

**Test Cases**: Scenario "Admin can revoke any user's tokens"

---

## Traceability Matrix

| Requirement ID | Feature File | Scenario(s) | Priority | Status |
|---------------|--------------|-------------|----------|--------|
| REQ-PAT-FUNC-001 | 01-token-creation | User creates PAT with read scope | Critical | ✅ |
| REQ-PAT-FUNC-002 | 01-token-creation | Multiple scope scenarios | Critical | ✅ |
| REQ-PAT-FUNC-003 | 01-token-creation | PAT creation fails without name | High | ✅ |
| REQ-PAT-FUNC-004 | 01-token-creation | PAT creation fails with duplicate name | High | ✅ |
| REQ-PAT-FUNC-005 | 01-token-creation | Custom/no expiration | High | ✅ |
| REQ-PAT-SEC-001 | 01-token-creation | Token value displayed only once | Critical | ✅ |
| REQ-PAT-SEC-002 | 01-token-creation | Token securely hashed | Critical | ✅ |
| REQ-PAT-UI-001 | 01-token-creation | Copy token to clipboard | Medium | ✅ |
| REQ-PAT-FUNC-006 | 01-token-creation | User can create multiple PATs | High | ✅ |
| REQ-PAT-FUNC-007 | 01-token-creation | Token metadata storage | Medium | ✅ |
| REQ-PAT-SEC-003 | 01-token-creation | Token information minimization | High | ✅ |
| REQ-PAT-FUNC-008 | 02-token-management | User views active tokens | Critical | ✅ |
| REQ-PAT-FUNC-009 | 02-token-management | Token list shows metadata | High | ✅ |
| REQ-PAT-FUNC-010 | 02-token-management | User revokes active token | Critical | ✅ |
| REQ-PAT-SEC-004 | 02-token-management | Token revocation is immediate | Critical | ✅ |
| REQ-PAT-FUNC-011 | 02-token-management | Revoked token cannot authenticate | Critical | ✅ |
| REQ-PAT-FUNC-012 | 02-token-management | User views revoked tokens | Medium | ✅ |
| REQ-PAT-FUNC-013 | 02-token-management | User identifies expired tokens | High | ✅ |
| REQ-PAT-FUNC-014 | 02-token-management | Warning for expiring tokens | Medium | ✅ |
| REQ-PAT-FUNC-015 | 02-token-management | Token last used tracking | Medium | ✅ |
| REQ-PAT-FUNC-016 | 02-token-management | User filters tokens by scope | Low | ✅ |
| REQ-PAT-FUNC-017 | 02-token-management | Token list sorted by creation date | Low | ✅ |
| REQ-PAT-FUNC-018 | 02-token-management | User can rename token | Medium | ✅ |
| REQ-PAT-UI-002 | 02-token-management | Token revocation confirmation | High | ✅ |
| REQ-PAT-FUNC-019 | 02-token-management | Token revocation cancellation | Medium | ✅ |
| REQ-PAT-SEC-005 | 02-token-management | Token ownership isolation | Critical | ✅ |
| REQ-PAT-UI-003 | 02-token-management | Token prefix display | Medium | ✅ |
| REQ-PAT-FUNC-020 | 03-token-authentication | Valid token authentication | Critical | ✅ |
| REQ-PAT-FUNC-021 | 03-token-authentication | Invalid token rejection | Critical | ✅ |
| REQ-PAT-FUNC-022 | 03-token-authentication | Expired token rejection | Critical | ✅ |
| REQ-PAT-FUNC-023 | 03-token-authentication | Revoked token rejection | Critical | ✅ |
| REQ-PAT-FUNC-024 | 03-token-authentication | Read scope authorization | Critical | ✅ |
| REQ-PAT-FUNC-025 | 03-token-authentication | Write scope authorization | Critical | ✅ |
| REQ-PAT-FUNC-026 | 03-token-authentication | Admin scope authorization | Critical | ✅ |
| REQ-PAT-SEC-006 | 03-token-authentication | Admin scope restriction | Critical | ✅ |
| REQ-PAT-FUNC-027 | 03-token-authentication | Token last used update | Medium | ✅ |
| REQ-PAT-SEC-007 | 03-token-authentication | Token case sensitivity | High | ✅ |
| REQ-PAT-FUNC-028 | 03-token-authentication | Token reusability | High | ✅ |
| REQ-PAT-FUNC-029 | 03-token-authentication | Authorization header support | Critical | ✅ |
| REQ-PAT-FUNC-030 | 03-token-authentication | Custom header support | High | ✅ |
| REQ-PAT-FUNC-031 | 03-token-authentication | Unauthenticated request rejection | Critical | ✅ |
| REQ-PAT-SEC-008 | 03-token-authentication | Token ownership enforcement | Critical | ✅ |
| REQ-PAT-FUNC-032 | 03-token-authentication | Immediate token activation | High | ✅ |
| REQ-PAT-FUNC-033 | 03-token-authentication | Scope-based authorization matrix | Critical | ✅ |
| REQ-PAT-SEC-009 | 03-token-authentication | Token authentication logging | Medium | ✅ |
| REQ-PAT-FUNC-034 | 03-token-authentication | Cross-client compatibility | High | ✅ |
| REQ-PAT-FUNC-035 | 02-token-management | Admin view user token counts | Medium | ✅ |
| REQ-PAT-FUNC-036 | 02-token-management | Admin revoke user tokens | High | ✅ |

---

## Summary Statistics

- **Total Requirements**: 47
- **Critical Priority**: 24
- **High Priority**: 14
- **Medium Priority**: 8
- **Low Priority**: 2

**Category Breakdown**:
- Functional: 34
- Security: 9
- User Interface: 3

**Feature Coverage**:
- `01-token-creation.feature`: 19 scenarios covered
- `02-token-management.feature`: 17 scenarios covered
- `03-token-authentication.feature`: 21 scenarios covered

---

## Notes

1. Token values must use cryptographically secure random generation with sufficient entropy.
2. Token hashing should use bcrypt, argon2, or similar with unique salts.
3. The scope hierarchy is: admin > write > read, where higher scopes include lower permissions.
4. Token prefixes should be sufficient for identification (8-10 characters) without revealing the full token.
5. Admin-scoped tokens are powerful and should be used sparingly with short expiration.
6. Consider implementing rate limiting on token authentication to prevent abuse.
7. Token authentication logs should be monitored for suspicious patterns.

---

**Document Control**:
- **Created**: 2025-11-01
- **Author**: Development Team
- **Reviewers**: [Pending]
- **Approval Status**: Draft
