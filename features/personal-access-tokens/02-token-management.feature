@personal-access-tokens @api
Feature: Personal Access Token Management
  As a user
  I want to manage my API tokens
  So that I can control access to my account via API

  Background:
    Given the user is logged in
    And the user has the following PATs:
      | name           | scope | created_days_ago | last_used_days_ago | expires_in_days | is_active |
      | CI/CD Token    | write | 30               | 1                  | 60              | true      |
      | Read Only      | read  | 60               | 30                 | 30              | true      |
      | Old Token      | write | 90               | 90                 | -10             | true      |
      | Revoked Token  | write | 10               | null               | 80              | false     |

  @positive
  Scenario: User views list of their active tokens
    When the user views their token list
    Then the active tokens are displayed:
      | name        | scope | status |
      | CI/CD Token | write | active |
      | Read Only   | read  | active |
    And revoked tokens are not shown by default

  @positive
  Scenario: Token list shows metadata
    When the user views their token list
    Then each token displays:
      | field           | displayed |
      | name            | yes       |
      | scope           | yes       |
      | created_at      | yes       |
      | expires_at      | yes       |
      | last_used       | yes       |
      | token_prefix    | yes       |
    And the full token value is not displayed

  @positive
  Scenario: User revokes an active token
    When the user revokes the token "CI/CD Token"
    And confirms the revocation
    Then the token is revoked successfully
    And a success message "Token revoked" is displayed
    And the token no longer appears in active list

  @positive
  Scenario: Revoked token cannot authenticate
    Given the user revoked token "CI/CD Token"
    When an API request is made with the revoked token
    Then authentication fails with error "Invalid or revoked token"
    And access to protected resources is denied

  @security
  Scenario: Token revocation is immediate
    Given the user has an active token
    When the user revokes the token
    Then the token is invalidated immediately
    And any in-flight requests with the token fail
    And no grace period exists

  @positive
  Scenario: User views revoked tokens
    When the user filters token list to show revoked tokens
    Then revoked tokens are displayed:
      | name          | status  | revoked_at      |
      | Revoked Token | revoked | [timestamp]     |
    And the revocation timestamp is shown

  @positive
  Scenario: User identifies expired tokens
    When the user views their token list
    Then the expired token "Old Token" shows status "expired"
    And an expiration icon is displayed
    And a warning about expired token is shown

  @negative
  Scenario: User cannot view another user's tokens
    Given another user "other@example.com" exists
    And the other user has PATs
    When the user attempts to view the other user's tokens
    Then access is denied
    And no token information is revealed

  @negative
  Scenario: User cannot revoke another user's tokens
    Given another user "other@example.com" has a PAT
    When the user attempts to revoke the other user's token
    Then access is denied
    And the other user's token remains active

  @positive
  Scenario: Token list shows last used timestamp
    When the user views the token "CI/CD Token"
    Then the "Last Used" field shows "1 day ago"
    And helps identify actively used tokens

  @positive
  Scenario: Token list shows unused tokens
    Given a token has never been used
    When the user views their token list
    Then the token shows "Last Used: Never"
    And helps identify unused tokens

  @positive
  Scenario: User filters tokens by scope
    When the user filters token list by scope "write"
    Then only write-scoped tokens are displayed:
      | name        | scope |
      | CI/CD Token | write |
    And read-scoped tokens are hidden

  @positive
  Scenario: Token list is sorted by creation date
    When the user views their token list
    Then tokens are sorted by creation date descending
    And most recently created tokens appear first

  @positive
  Scenario: User sees warning for expiring tokens
    Given a token expires in 7 days
    When the user views their token list
    Then an expiration warning is displayed
    And the warning says "Expires soon"
    And the expiration date is highlighted

  @positive
  Scenario: User can rename a token
    When the user renames token "Old Name" to "New Name"
    Then the token name is updated successfully
    And the token value remains unchanged
    And the renamed token appears in the list

  @negative
  Scenario: User cannot rename token to existing name
    Given tokens "Token A" and "Token B" exist
    When the user attempts to rename "Token A" to "Token B"
    Then the rename fails with error "Token name already exists"
    And "Token A" keeps its original name

  @positive @admin
  Scenario: Admin can view all users' token counts
    Given the admin is logged in
    When the admin views the user list
    Then each user shows their active token count
    And the admin can identify users with many tokens

  @positive @admin
  Scenario: Admin can revoke any user's tokens
    Given the admin is logged in
    And a user has an active PAT "User Token"
    When the admin revokes the user's token
    Then the token is revoked successfully
    And the user can no longer use the token

  @positive
  Scenario: User receives confirmation before revoking token
    When the user clicks revoke on token "Important Token"
    Then a confirmation dialog appears
    And the dialog warns "This action cannot be undone"
    And the user must confirm to proceed

  @positive
  Scenario: Token revocation can be cancelled
    When the user clicks revoke on a token
    And the confirmation dialog appears
    And the user cancels the operation
    Then the token remains active
    And no changes are made

  @security
  Scenario: Token prefix provides identification without exposure
    When the user views their token list
    Then each token shows a prefix like "demo_123..."
    And the prefix helps identify tokens without revealing full value
    And the remaining characters are masked
