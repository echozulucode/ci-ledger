@user-management @admin @search
Feature: User Search and Filtering
  As an administrator
  I want to search and filter users
  So that I can quickly find specific users

  Background:
    Given the admin is logged in
    And the following users exist:
      | email                | full_name      | role  | is_active |
      | alice@example.com    | Alice Johnson  | user  | true      |
      | bob@example.com      | Bob Williams   | admin | true      |
      | carol@example.com    | Carol Davis    | user  | false     |
      | david@example.com    | David Brown    | user  | true      |

  @positive @admin
  Scenario: Admin searches users by email
    When the admin searches for email containing "alice"
    Then the search results include:
      | email             | full_name     |
      | alice@example.com | Alice Johnson |
    And the result count is 1

  @positive @admin
  Scenario: Admin searches users by partial email
    When the admin searches for email containing "@example"
    Then all users with "@example" in email are returned
    And the result count is 4

  @positive @admin
  Scenario: Admin searches users by full name
    When the admin searches for name containing "Bob"
    Then the search results include:
      | email           | full_name    |
      | bob@example.com | Bob Williams |
    And the result count is 1

  @positive @admin
  Scenario: Admin filters users by active status
    When the admin filters by status "active"
    Then the results include only active users:
      | email              | is_active |
      | alice@example.com  | true      |
      | bob@example.com    | true      |
      | david@example.com  | true      |
    And inactive users are not shown

  @positive @admin
  Scenario: Admin filters users by inactive status
    When the admin filters by status "inactive"
    Then the results include only inactive users:
      | email             | is_active |
      | carol@example.com | false     |
    And active users are not shown

  @positive @admin
  Scenario: Admin filters users by role
    When the admin filters by role "admin"
    Then the results include only admin users:
      | email           | role  |
      | bob@example.com | admin |
    And regular users are not shown

  @positive @admin
  Scenario: Admin filters users by regular user role
    When the admin filters by role "user"
    Then the results include:
      | email              | role |
      | alice@example.com  | user |
      | carol@example.com  | user |
      | david@example.com  | user |
    And admin users are not shown

  @positive @admin
  Scenario: Admin combines search and filter
    When the admin searches for email containing "example"
    And filters by status "active"
    And filters by role "user"
    Then the results include:
      | email              | full_name     | role | is_active |
      | alice@example.com  | Alice Johnson | user | true      |
      | david@example.com  | David Brown   | user | true      |
    And the result count is 2

  @positive @admin
  Scenario: Search returns no results for non-matching query
    When the admin searches for email "nonexistent@example.com"
    Then no results are returned
    And a message "No users found" is displayed

  @positive @admin
  Scenario: Admin clears search filters
    Given the admin has applied search filters
    When the admin clears all filters
    Then all users are displayed
    And the result count matches total user count

  @negative
  Scenario: Regular user cannot search users
    Given a regular user is logged in
    When the user attempts to search users
    Then access is denied with status code 403

  @positive @admin
  Scenario: Admin searches with case-insensitive match
    When the admin searches for "ALICE"
    Then the search results include:
      | email             | full_name     |
      | alice@example.com | Alice Johnson |
    And the search is case-insensitive

  @positive @admin
  Scenario: Admin filters LDAP users
    Given LDAP users exist in the system
    When the admin filters by authentication type "LDAP"
    Then only LDAP users are displayed
    And local users are excluded

  @positive @admin
  Scenario: Admin filters local users
    Given both LDAP and local users exist
    When the admin filters by authentication type "local"
    Then only local users are displayed
    And LDAP users are excluded

  @positive @admin
  Scenario: Search results are paginated
    Given 50 users exist in the system
    When the admin views the user list
    Then results are displayed in pages
    And pagination controls are available
    And the admin can navigate between pages

  @positive @admin
  Scenario: Admin sorts users by email
    When the admin sorts users by email ascending
    Then users are displayed in alphabetical order by email
    And the first result is "alice@example.com"

  @positive @admin
  Scenario: Admin sorts users by name
    When the admin sorts users by full name descending
    Then users are displayed in reverse alphabetical order by name
    And the first result is "David Brown"
