@security @audit @admin
Feature: Security audit logging
  As a security administrator
  I want privileged actions recorded
  So that I can trace changes without exposing secrets

  Background:
    Given audit logging is enabled

  @smoke
  Scenario: Admin action is recorded with context
    Given an admin user is logged in
    And a standard user exists
    When the admin deactivates the user account
    Then an audit record captures the actor, target user, action, and timestamp
    And the audit record omits secrets and token values

  @negative
  Scenario: Non-admin cannot view audit log
    Given a regular user is logged in
    When the user attempts to view the audit log
    Then access is denied
    And no audit entries are exposed

  @regression
  Scenario Outline: Audit entries capture outcomes
    Given an admin user is logged in
    When the admin performs a privileged action "<action>"
    Then an audit record is stored with action "<action>" and outcome "<outcome>"

    Examples:
      | action            | outcome   |
      | reset password    | success   |
      | change user role  | success   |
      | revoke token      | failure   |
