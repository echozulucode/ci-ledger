@user-management @profile @smoke
Feature: User Profile Management
  As a registered user
  I want to manage my profile information
  So that I can keep my account details current

  Background:
    Given the user is logged in with email "user@example.com"

  @positive
  Scenario: User views their own profile
    When the user views their profile
    Then the profile is displayed with:
      | field      | value              |
      | email      | user@example.com   |
      | full_name  | Test User          |
      | is_active  | true               |
      | role       | user               |

  @positive
  Scenario: User updates their full name
    When the user updates their full name to "Jane Updated Smith"
    Then the profile is updated successfully
    And a success message is displayed
    And the full name shows as "Jane Updated Smith"

  @positive
  Scenario: User updates their email address
    Given no other user has email "newemail@example.com"
    When the user updates their email to "newemail@example.com"
    Then the profile is updated successfully
    And the user can log in with the new email

  @negative
  Scenario: User cannot update email to existing email
    Given another user exists with email "existing@example.com"
    When the user attempts to update their email to "existing@example.com"
    Then the update fails with error "Email already in use"
    And the email remains unchanged

  @negative
  Scenario: User cannot update another user's profile
    Given another user exists with email "other@example.com"
    When the user attempts to update the other user's profile
    Then access is denied with error "Forbidden"
    And the other user's profile remains unchanged

  @negative
  Scenario: Profile update fails with invalid email format
    When the user attempts to update email to "invalid-email"
    Then the update fails with error "Invalid email format"
    And the email remains unchanged

  @positive
  Scenario: LDAP user can view but not edit core profile fields
    Given the user is authenticated via LDAP
    When the user views their profile
    Then the profile is displayed
    And email field is marked as read-only
    And full name field is marked as read-only

  @security
  Scenario: User cannot view other users' profiles
    Given the user "user1@example.com" is logged in
    When the user attempts to access profile of "user2@example.com"
    Then access is denied
    And no profile information is revealed

  @positive
  Scenario: Profile shows LDAP user indicator
    Given the user is authenticated via LDAP
    When the user views their profile
    Then the profile indicates "Authentication: LDAP"
    And shows a note about managing credentials in Active Directory

  @positive
  Scenario: Profile shows local user indicator
    Given the user has a local account
    When the user views their profile
    Then the profile indicates "Authentication: Local"
    And shows options to change password
