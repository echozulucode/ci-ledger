@authentication @authorization @rbac @smoke
Feature: Role-Based Access Control
  As a system administrator
  I want to control access based on user roles
  So that sensitive features are protected from unauthorized access

  Background:
    Given the application has two roles: "user" and "admin"

  @positive @admin
  Scenario: Admin user can access admin-only endpoints
    Given the admin is logged in with role "admin"
    When the admin accesses the user management endpoint
    Then access is granted
    And the requested resource is returned

  @negative @authorization
  Scenario: Regular user cannot access admin-only endpoints
    Given the user is logged in with role "user"
    When the user attempts to access the user management endpoint
    Then access is denied with status code 403
    And an error message "Insufficient permissions" is displayed

  @negative @authorization
  Scenario: Unauthenticated user cannot access protected endpoints
    Given the user is not logged in
    When the user attempts to access any protected endpoint
    Then access is denied with status code 401
    And the user is prompted to authenticate

  @positive
  Scenario: User role is included in JWT token claims
    When the user logs in with role "user"
    Then the JWT token includes claim "is_admin" set to "false"

  @positive
  Scenario: Admin role is included in JWT token claims
    When the admin logs in with role "admin"
    Then the JWT token includes claim "is_admin" set to "true"

  @authorization
  Scenario: Admin can perform all user operations
    Given the admin is logged in
    When the admin performs any user-level operation
    Then the operation succeeds
    And the admin has full access to user features

  @authorization
  Scenario Outline: Access control by endpoint and role
    Given a user is logged in with role "<role>"
    When the user accesses the "<endpoint>" endpoint
    Then access is "<result>"

    Examples:
      | role  | endpoint              | result  |
      | admin | /api/users            | granted |
      | user  | /api/users            | denied  |
      | admin | /api/users/me         | granted |
      | user  | /api/users/me         | granted |
      | admin | /api/items            | granted |
      | user  | /api/items            | granted |
      | admin | /api/users/me/tokens  | granted |
      | user  | /api/users/me/tokens  | granted |

  @negative
  Scenario: User cannot elevate their own privileges
    Given the user is logged in with role "user"
    When the user attempts to update their own role to "admin"
    Then the operation is denied
    And the user role remains "user"

  @positive @admin
  Scenario: Admin can assign roles to other users
    Given the admin is logged in
    And a user exists with email "user@example.com" and role "user"
    When the admin changes the user role to "admin"
    Then the role is updated successfully
    And the user now has admin privileges

  @positive @admin
  Scenario: Admin can revoke admin role from users
    Given the admin is logged in
    And a user exists with email "admin2@example.com" and role "admin"
    When the admin changes the user role to "user"
    Then the role is updated successfully
    And the user no longer has admin privileges

  @negative
  Scenario: User cannot view other users' information
    Given the user "user1@example.com" is logged in
    And another user "user2@example.com" exists
    When user1 attempts to view user2's profile
    Then access is denied with error "Forbidden"

  @positive
  Scenario: User can view their own information
    Given the user is logged in with email "user@example.com"
    When the user views their own profile
    Then the profile is displayed successfully
    And contains the user's information

  @authorization
  Scenario: Role-based access works with API tokens
    Given the user has a PAT with role "user"
    When the user makes an API request with the PAT
    And attempts to access admin endpoint
    Then access is denied based on token role

  @authorization
  Scenario: Admin token provides admin access
    Given the admin has a PAT with admin scope
    When the admin makes an API request with the PAT
    And accesses admin endpoint
    Then access is granted
    And the operation succeeds

  @security
  Scenario: Role cannot be tampered in JWT token
    Given the user has a valid JWT token with role "user"
    When the token is modified to claim role "admin"
    And the user attempts to access admin endpoints
    Then the token is rejected as invalid
    And access is denied
