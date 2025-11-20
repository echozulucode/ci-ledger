@security @jwt @authentication
Feature: JWT Token Security
  As the system
  I want to secure JWT tokens
  So that authentication is protected from attacks

  Background:
    Given JWT authentication is configured
    And a secret key is securely stored

  @security
  Scenario: JWT token has expiration time
    When a user logs in successfully
    Then a JWT token is issued
    And the token includes an expiration claim
    And the expiration is set to 30 minutes from issuance

  @security
  Scenario: Expired JWT token is rejected
    Given a user logged in 2 hours ago
    And the JWT token has expired
    When the user attempts to access protected endpoint
    Then access is denied with status 401
    And the error message is "Token expired"
    And the user must re-authenticate

  @security
  Scenario: Tampered JWT token is rejected
    Given a user has a valid JWT token
    When the token payload is modified to change user ID
    And the user attempts to access protected resources
    Then access is denied with status 401
    And the error message is "Invalid token signature"
    And no access is granted

  @security
  Scenario: Token signature is modified
    Given a user has a valid JWT token
    When the token signature is altered
    And the user attempts to authenticate
    Then the token is rejected as invalid
    And authentication fails

  @security
  Scenario: JWT token includes user ID claim
    When a user logs in
    Then the JWT token payload includes claim "sub" with user ID
    And the user ID is used for authorization
    And the user ID cannot be tampered

  @security
  Scenario: JWT token includes role claim
    When a user with role "admin" logs in
    Then the JWT token includes claim "is_admin" set to true
    And the role is used for authorization decisions
    And the role claim is validated on each request

  @security
  Scenario: JWT token requires secret key for validation
    Given a JWT token is issued
    When the token is validated
    Then the secret key must match
    And tokens signed with different keys are rejected
    And the secret key is never exposed

  @security
  Scenario: JWT secret key is not exposed
    When the application runs
    Then the JWT secret key is stored securely
    And the key is not logged
    And the key is not returned in API responses
    And the key is loaded from environment variables

  @security
  Scenario: JWT token uses strong signing algorithm
    When a JWT token is created
    Then the token uses HS256 algorithm
    And the algorithm is specified in token header
    And weak algorithms are not accepted

  @security
  Scenario: JWT token includes issued-at timestamp
    When a user logs in
    Then the JWT token includes "iat" claim
    And the timestamp reflects token creation time
    And the timestamp helps detect token replay

  @security
  Scenario: Token with future issued-at is rejected
    Given a JWT token with "iat" claim in the future
    When the token is validated
    Then the token is rejected as invalid
    And clock skew attacks are prevented

  @security
  Scenario: JWT token cannot be reused after expiration
    Given a user's JWT token expired 1 hour ago
    When the user attempts multiple requests with expired token
    Then all requests are rejected
    And re-authentication is required
    And expired tokens cannot be refreshed

  @security
  Scenario: JWT token survives server restart
    Given a user has a valid JWT token
    When the application server restarts
    And the user makes a request with the same token
    Then the token remains valid
    And authentication succeeds
    And stateless authentication is maintained

  @security
  Scenario: Different users receive different tokens
    When user A logs in
    And user B logs in
    Then user A's token is different from user B's token
    And each token contains unique user information
    And tokens cannot be interchanged

  @security
  Scenario: Admin token has admin privileges
    When an admin user logs in
    Then the JWT token includes "is_admin: true"
    And the token grants admin access
    And admin endpoints are accessible

  @security
  Scenario: Regular user token lacks admin privileges
    When a regular user logs in
    Then the JWT token includes "is_admin: false"
    And the token does not grant admin access
    And admin endpoints are denied

  @security
  Scenario: Token claims cannot be escalated
    Given a regular user has a JWT token
    When the token payload is modified to claim admin role
    And the user attempts to access admin endpoints
    Then the modified token is rejected
    And the signature validation fails
    And access is denied

  @security
  Scenario: JWT token is validated on every request
    Given a user has a valid JWT token
    When the user makes 5 API requests
    Then each request validates the token
    And signature is verified each time
    And expiration is checked each time
    And no caching bypasses validation

  @security
  Scenario: Invalid JWT format is rejected
    When a request includes malformed token "not.a.valid.jwt.token"
    Then authentication fails immediately
    And the error message is "Invalid token format"
    And no further processing occurs

  @security
  Scenario: Empty or missing token is rejected
    When a request is made without Authorization header
    Then authentication fails with status 401
    And the error message is "Not authenticated"
    And access to protected resources is denied

  @security
  Scenario: JWT token includes minimal necessary information
    When a JWT token is issued
    Then the token includes only:
      | claim    | included |
      | sub      | yes      |
      | is_admin | yes      |
      | exp      | yes      |
      | iat      | yes      |
    And sensitive information like password is never included
    And token size is kept minimal
