@personal-access-tokens @api @smoke
Feature: Personal Access Token Creation
  As a user
  I want to create API tokens
  So that I can authenticate API requests programmatically

  Background:
    Given the user is logged in

  @positive
  Scenario: User creates PAT with read scope
    When the user creates a PAT with:
      | name        | scope | expires_in_days |
      | My Read Key | read  | 30              |
    Then the token is created successfully
    And the token value is displayed once
    And the token has scope "read"
    And the token expires in 30 days
    And a success message is displayed

  @positive
  Scenario: User creates PAT with write scope
    When the user creates a PAT with:
      | name         | scope | expires_in_days |
      | My Write Key | write | 90              |
    Then the token is created successfully
    And the token has scope "write"
    And the token can perform read and write operations

  @positive @admin
  Scenario: Admin creates PAT with admin scope
    Given the admin is logged in
    When the admin creates a PAT with:
      | name         | scope | expires_in_days |
      | My Admin Key | admin | 90              |
    Then the token is created successfully
    And the token has scope "admin"
    And the token has full administrative privileges

  @negative
  Scenario: Regular user cannot create PAT with admin scope
    Given a regular user is logged in
    When the user attempts to create a PAT with scope "admin"
    Then creation fails with error "Insufficient permissions for admin scope"
    And no token is created

  @positive
  Scenario: User names their token for identification
    When the user creates a PAT with name "GitHub Actions Token"
    Then the token is created with the specified name
    And the name appears in the token list
    And the name helps identify the token's purpose

  @positive
  Scenario: Token value is displayed only once after creation
    When the user creates a PAT
    Then the full token value is displayed
    And a warning "Save this token now - it won't be shown again" is displayed
    And the user can copy the token to clipboard

  @security
  Scenario: Token value is never shown again after initial creation
    Given the user created a PAT
    And navigated away from the creation page
    When the user views their token list
    Then only the token prefix is shown
    And the full token value is not retrievable

  @positive
  Scenario: User creates PAT with custom expiration
    When the user creates a PAT with expiration of 180 days
    Then the token is created successfully
    And the expiration date is set to 180 days from now
    And the expiration date is displayed in the token list

  @positive
  Scenario: User creates PAT with no expiration
    When the user creates a PAT with no expiration date
    Then the token is created successfully
    And the token shows "Never expires"
    And a security warning about non-expiring tokens is displayed

  @positive
  Scenario: User can create multiple PATs
    When the user creates the following PATs:
      | name         | scope | expires_in_days |
      | CI/CD Token  | write | 90              |
      | Read Token   | read  | 30              |
      | Test Token   | write | 7               |
    Then all tokens are created successfully
    And all tokens appear in the token list
    And each token has a unique value

  @negative
  Scenario: PAT creation fails with duplicate name
    Given a PAT exists with name "My Token"
    When the user attempts to create another PAT with name "My Token"
    Then creation fails with error "Token name already exists"
    And no duplicate token is created

  @negative
  Scenario: PAT creation fails without name
    When the user attempts to create a PAT without providing a name
    Then creation fails with error "Token name is required"
    And no token is created

  @negative
  Scenario: PAT creation fails with invalid scope
    When the user attempts to create a PAT with scope "invalid"
    Then creation fails with error "Invalid scope"
    And no token is created

  @negative
  Scenario: PAT creation fails with negative expiration
    When the user attempts to create a PAT with expiration of -1 days
    Then creation fails with error "Invalid expiration date"
    And no token is created

  @security
  Scenario: Created PAT is securely hashed in database
    When the user creates a PAT
    Then the token value is hashed before storage
    And only the hash is stored in the database
    And the plaintext token is never stored

  @positive
  Scenario: Token creation updates last activity timestamp
    When the user creates a PAT
    Then the token shows creation timestamp
    And the "Last Used" field shows "Never" initially

  @security
  Scenario: Token includes only necessary information
    When the user creates a PAT
    Then the token includes:
      | field      | included |
      | user_id    | yes      |
      | scope      | yes      |
      | expiration | yes      |
    And sensitive user information is not included in token

  @positive
  Scenario: User can copy token to clipboard
    When the user creates a PAT
    And the token value is displayed
    And the user clicks the copy button
    Then the token is copied to clipboard
    And a confirmation message is displayed
