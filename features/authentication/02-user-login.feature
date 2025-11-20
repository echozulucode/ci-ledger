@authentication @login @smoke
Feature: User Login
  As a registered user
  I want to log in with my credentials
  So that I can access my account and protected features

  Background:
    Given the login system is available
    And the following user exists:
      | email              | full_name  | password     | is_active | role  |
      | user@example.com   | Jane Smith | SecureP@ss1  | true      | user  |

  @positive
  Scenario: Successful login with valid credentials
    When the user logs in with email "user@example.com" and password "SecureP@ss1"
    Then the user is authenticated successfully
    And a JWT access token is returned
    And the token contains user ID and role
    And the user is redirected to the dashboard

  @negative
  Scenario: Login fails with incorrect password
    When the user attempts to login with email "user@example.com" and password "WrongPassword"
    Then authentication fails with error "Invalid credentials"
    And no JWT token is returned
    And the user remains on the login page

  @negative
  Scenario: Login fails with non-existent user
    When the user attempts to login with email "nonexistent@example.com" and password "AnyPassword"
    Then authentication fails with error "Invalid credentials"
    And no JWT token is returned

  @negative
  Scenario: Login fails with inactive account
    Given the user account "user@example.com" is deactivated
    When the user attempts to login with email "user@example.com" and password "SecureP@ss1"
    Then authentication fails with error "Account is inactive"
    And the user cannot access protected resources

  @security
  Scenario: JWT token includes correct user information
    When the user logs in successfully with email "user@example.com"
    Then the JWT token payload includes:
      | field    | value                 |
      | sub      | user ID               |
      | is_admin | false                 |
    And the token has an expiration time
    And the token can be used for API authentication

  @positive
  Scenario: User can logout successfully
    Given the user is logged in
    When the user logs out
    Then the user session is terminated
    And the user is redirected to the login page
    And protected resources are no longer accessible

  @security
  Scenario: Expired JWT token is rejected
    Given the user logged in 2 hours ago
    And the JWT token has expired
    When the user attempts to access protected resources with expired token
    Then access is denied with error "Token expired"
    And the user must log in again

  @security
  Scenario: Tampered JWT token is rejected
    Given the user has a valid JWT token
    When the token payload is modified
    And the user attempts to access protected resources
    Then access is denied with error "Invalid token"

  @positive
  Scenario Outline: Multiple users can login independently
    Given a user exists with email "<email>" and role "<role>"
    When the user logs in with email "<email>" and correct password
    Then the user is authenticated as "<full_name>"
    And the token reflects the correct role "<role>"

    Examples:
      | email              | full_name      | role  |
      | user@example.com   | Jane Smith     | user  |
      | admin@example.com  | Admin User     | admin |
      | test@example.com   | Test User      | user  |

  @security
  Scenario: Failed login attempts do not reveal account existence
    When the user attempts to login with non-existent email
    Then authentication fails with generic error "Invalid credentials"
    And the error message is the same as for incorrect password
    And no information about account existence is revealed

  @positive
  Scenario: User can login from different sessions simultaneously
    Given the user is logged in from browser A
    When the user logs in from browser B
    Then both sessions are active
    And each session has a unique JWT token
    And both tokens can access protected resources
