@personal-access-tokens @api @authentication @smoke
Feature: PAT Authentication
  As a developer
  I want to authenticate API requests with personal access tokens
  So that I can access the API programmatically

  Background:
    Given the user has created a valid PAT
    And the API is available

  @positive
  Scenario: API request authenticates with valid PAT
    When an API request is made to "/api/users/me" with valid PAT
    Then the request is authenticated successfully
    And the user's information is returned
    And the response status is 200

  @negative
  Scenario: API request fails with invalid PAT
    When an API request is made with invalid PAT "invalid_token_12345"
    Then authentication fails with status 401
    And the error message is "Invalid or revoked token"
    And access to protected resources is denied

  @negative
  Scenario: API request fails with expired PAT
    Given the user has a PAT that expired yesterday
    When an API request is made with the expired PAT
    Then authentication fails with status 401
    And the error message is "Token has expired"
    And the request is rejected

  @negative
  Scenario: API request fails with revoked PAT
    Given the user created a PAT
    And the PAT was revoked
    When an API request is made with the revoked PAT
    Then authentication fails with status 401
    And the error message is "Invalid or revoked token"
    And access is denied

  @authorization
  Scenario: Read-scoped token can access read-only endpoints
    Given the user has a PAT with scope "read"
    When an API GET request is made to "/api/items"
    Then the request succeeds
    And the items list is returned

  @authorization
  Scenario: Read-scoped token cannot access write endpoints
    Given the user has a PAT with scope "read"
    When an API POST request is made to "/api/items"
    Then the request fails with status 403
    And the error message is "Insufficient permissions"
    And no item is created

  @authorization
  Scenario: Write-scoped token can access read endpoints
    Given the user has a PAT with scope "write"
    When an API GET request is made to "/api/items"
    Then the request succeeds
    And the items list is returned

  @authorization
  Scenario: Write-scoped token can access write endpoints
    Given the user has a PAT with scope "write"
    When an API POST request is made to "/api/items" with data:
      | title       | description  | status  |
      | Test Item   | Test desc    | active  |
    Then the request succeeds
    And the item is created
    And the response status is 201

  @authorization
  Scenario: Write-scoped token cannot access admin endpoints
    Given the user has a PAT with scope "write"
    When an API request is made to "/api/users" (admin endpoint)
    Then the request fails with status 403
    And the error message is "Admin access required"

  @authorization @admin
  Scenario: Admin-scoped token can access all endpoints
    Given the admin has a PAT with scope "admin"
    When API requests are made to:
      | endpoint                | method |
      | /api/users/me           | GET    |
      | /api/items              | POST   |
      | /api/users              | GET    |
    Then all requests succeed
    And full access is granted

  @negative
  Scenario: Regular user token with admin scope is rejected
    Given a regular user attempts to create admin-scoped PAT
    And the token creation was prevented
    When an API request includes a manually crafted admin-scoped token
    Then authentication fails
    And the token is rejected as invalid

  @security
  Scenario: PAT authentication works for all API endpoints
    Given the user has a PAT with appropriate scope
    When API requests are made to various endpoints:
      | endpoint                | requires_scope |
      | /api/users/me           | read           |
      | /api/users/me/tokens    | read           |
      | /api/items              | read           |
    Then all requests authenticate successfully with the PAT

  @positive
  Scenario: Token last used timestamp is updated
    Given the user has a PAT that was never used
    When an API request is made with the PAT
    Then the request succeeds
    And the token's "last_used" timestamp is updated
    And the timestamp reflects the current time

  @security
  Scenario: Token authentication is case-sensitive
    Given the user has a valid PAT "demo_ABC123def456"
    When an API request is made with token "demo_abc123def456"
    Then authentication fails
    And the token is not recognized

  @positive
  Scenario: Multiple requests with same token succeed
    Given the user has a valid PAT
    When 10 API requests are made with the same PAT
    Then all requests authenticate successfully
    And the token remains valid
    And rate limiting is applied if configured

  @security
  Scenario: Token authentication via Authorization header
    Given the user has a valid PAT "demo_abc123"
    When an API request includes header "Authorization: Bearer demo_abc123"
    Then the request authenticates successfully
    And the user is identified from the token

  @security
  Scenario: Token authentication via custom header
    Given the user has a valid PAT "demo_abc123"
    When an API request includes header "X-API-Key: demo_abc123"
    Then the request authenticates successfully
    And the user is identified from the token

  @negative
  Scenario: Request fails without authentication
    When an API request is made without any token or credentials
    Then the request fails with status 401
    And the error message is "Not authenticated"
    And access to protected resources is denied

  @negative
  Scenario: Token from different user cannot access resources
    Given user A has a PAT
    And user B has items
    When user A makes an API request to access user B's items
    Then access is denied based on ownership rules
    And user B's items are not returned

  @positive
  Scenario: Token works immediately after creation
    When the user creates a new PAT
    And immediately makes an API request with the new PAT
    Then the request succeeds
    And there is no delay in token activation

  @authorization
  Scenario Outline: Scope-based authorization matrix
    Given the user has a PAT with scope "<scope>"
    When an API <method> request is made to "<endpoint>"
    Then the request result is "<result>"

    Examples:
      | scope | method | endpoint          | result  |
      | read  | GET    | /api/users/me     | success |
      | read  | POST   | /api/items        | denied  |
      | read  | PUT    | /api/items/1      | denied  |
      | read  | DELETE | /api/items/1      | denied  |
      | write | GET    | /api/users/me     | success |
      | write | POST   | /api/items        | success |
      | write | PUT    | /api/items/1      | success |
      | write | DELETE | /api/items/1      | success |
      | write | GET    | /api/users        | denied  |
      | admin | GET    | /api/users        | success |
      | admin | POST   | /api/users        | success |
      | admin | DELETE | /api/users/1      | success |

  @security
  Scenario: Token authentication logs activity
    When an API request is made with a PAT
    Then the authentication attempt is logged
    And the log includes timestamp, user, and endpoint
    And token value is not logged

  @positive
  Scenario: Token authentication works across different clients
    Given the user has a valid PAT
    When API requests are made from:
      | client           |
      | HTTPie           |
      | curl             |
      | Postman          |
      | Python requests  |
      | JavaScript fetch |
    Then all requests authenticate successfully
    And the PAT works consistently across clients
