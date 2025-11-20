@authentication @password-management
Feature: Password Management
  As a registered user
  I want to manage my password
  So that I can maintain account security

  Background:
    Given the user is logged in
    And the user has a local account (not LDAP)

  @positive
  Scenario: User changes password successfully
    When the user changes password from "OldP@ss1" to "NewP@ss2"
    And provides the correct current password
    Then the password is updated successfully
    And a success message is displayed
    And the user can log in with the new password

  @negative
  Scenario: Password change fails with incorrect current password
    When the user attempts to change password
    And provides incorrect current password
    Then the password change fails with error "Current password is incorrect"
    And the password remains unchanged

  @negative @security
  Scenario: Password change fails with weak new password
    When the user attempts to change password to "weak"
    Then the password change fails with password validation error
    And the error indicates password requirements
    And the password remains unchanged

  @negative
  Scenario Outline: Password change fails with invalid new password
    When the user attempts to change password to "<new_password>"
    Then the password change fails with password validation error
    And the password remains unchanged

    Examples:
      | new_password | reason                    |
      | short1!      | too short                 |
      | nouppercase1!| no uppercase letter       |
      | NOLOWERCASE1!| no lowercase letter       |
      | NoNumber!    | no number                 |
      | NoSpecial1   | no special character      |

  @security
  Scenario: New password is hashed with Argon2
    When the user changes password successfully
    Then the new password is hashed using Argon2
    And the plaintext password is never stored
    And the password hash is different from the password

  @security
  Scenario: Old password cannot be reused immediately after change
    Given the user successfully changed their password
    When the user logs in with the old password
    Then authentication fails
    And only the new password works

  @negative
  Scenario: LDAP user cannot change password in application
    Given the user is authenticated via LDAP
    When the user attempts to change password
    Then the operation fails with error "LDAP users must change password in Active Directory"
    And no password change is allowed

  @positive
  Scenario: Password change invalidates existing sessions optionally
    Given the user is logged in from multiple devices
    When the user changes their password
    And the user logs in again with the new password
    Then the user can access the application
    And a new JWT token is issued

  @security
  Scenario: Password change requires re-authentication
    Given the user session is older than 30 minutes
    When the user attempts to change password
    Then the user is prompted to re-authenticate
    And must provide current password
    And the password change proceeds after verification

  @positive
  Scenario: Admin can reset user password
    Given the admin is logged in
    And a user exists with email "user@example.com"
    When the admin resets the password for "user@example.com"
    Then a temporary password is generated
    And the user is notified of the password reset
    And the user can login with the temporary password

  @security
  Scenario: Password reset requires user to change password on first login
    Given the admin reset the user password
    When the user logs in with temporary password
    Then the user is prompted to change password
    And must set a new password before accessing application
    And the temporary password expires after first use

  @security
  Scenario: Password meets complexity requirements
    When the user sets a new password
    Then the password must be at least 8 characters long
    And must contain at least one uppercase letter
    And must contain at least one lowercase letter
    And must contain at least one number
    And must contain at least one special character
