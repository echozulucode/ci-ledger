@authentication @ldap @integration
Feature: LDAP Authentication
  As a user with Active Directory credentials
  I want to log in using my LDAP account
  So that I can access the application without creating a separate password

  Background:
    Given LDAP authentication is enabled and configured
    And the LDAP server is accessible

  @positive
  Scenario: Successful LDAP authentication with valid AD credentials
    Given a user exists in Active Directory with username "jsmith"
    And the LDAP user is not yet provisioned in the application
    When the user logs in with LDAP username "jsmith" and AD password
    Then the user is authenticated successfully via LDAP
    And a local user account is auto-provisioned
    And the user receives a JWT token
    And the user can access the application

  @positive
  Scenario: LDAP user is provisioned with correct attributes
    Given a user exists in Active Directory with:
      | username | full_name    | email              | department |
      | jsmith   | John Smith   | jsmith@company.com | Engineering|
    When the user logs in via LDAP for the first time
    Then a local user account is created with:
      | email              | full_name    | is_active |
      | jsmith@company.com | John Smith   | true      |
    And the user is marked as an LDAP user

  @positive @authorization
  Scenario: LDAP user receives admin role from AD group membership
    Given a user "jsmith" belongs to AD group "IntranetAdmins"
    And the admin group mapping is configured for "IntranetAdmins"
    When the user logs in via LDAP
    Then the user is auto-provisioned with role "admin"
    And the user has admin privileges in the application

  @positive @authorization
  Scenario: LDAP user receives regular role without admin group
    Given a user "jdoe" exists in Active Directory
    And the user does not belong to admin groups
    When the user logs in via LDAP
    Then the user is auto-provisioned with role "user"
    And the user has regular user privileges

  @positive
  Scenario: Existing LDAP user can login after initial provisioning
    Given a user "jsmith" was previously provisioned from LDAP
    When the user logs in with LDAP credentials
    Then the user is authenticated successfully
    And no new account is created
    And the existing account is updated if needed

  @negative
  Scenario: LDAP authentication fails with incorrect password
    Given a user exists in Active Directory with username "jsmith"
    When the user attempts to login via LDAP with incorrect password
    Then authentication fails with error "Invalid LDAP credentials"
    And no user account is provisioned
    And no JWT token is issued

  @negative @authorization
  Scenario: LDAP user is denied access if not in allowed groups
    Given LDAP group filtering is enabled
    And allowed groups are configured as "IntranetUsers,IntranetAdmins"
    And a user "outsider" exists in AD but not in allowed groups
    When the user attempts to login via LDAP
    Then authentication fails with error "User not in allowed groups"
    And no account is provisioned

  @positive
  Scenario: Local admin user can login when LDAP is configured
    Given LDAP authentication is enabled
    And a local admin user exists with email "admin@example.com"
    When the local admin logs in with local credentials
    Then the user is authenticated using local authentication
    And the user receives admin privileges
    And LDAP is not consulted for local users

  @negative @fallback
  Scenario: LDAP authentication falls back gracefully when LDAP unavailable
    Given LDAP authentication is enabled
    And the LDAP server is unreachable
    And a local user exists with email "user@example.com"
    When the user attempts to login with local credentials
    Then the user is authenticated using local authentication
    And the user can access the application
    And an error is logged about LDAP unavailability

  @negative @fallback
  Scenario: LDAP user cannot login when LDAP server is unavailable
    Given LDAP authentication is enabled
    And the LDAP server is unreachable
    And an LDAP-only user exists in the application
    When the user attempts to login
    Then authentication fails with error "LDAP server unavailable"
    And the user cannot access the application

  @positive @admin
  Scenario: Admin can test LDAP connection
    Given the admin is logged in
    When the admin tests the LDAP connection via health endpoint
    Then the LDAP connection status is reported
    And the response indicates if LDAP is reachable
    And no sensitive credentials are exposed in the response

  @security
  Scenario: LDAP credentials are not logged or exposed
    Given LDAP authentication is configured
    When a user attempts to login via LDAP
    Then LDAP passwords are never logged
    And LDAP bind credentials are not exposed in errors
    And sensitive LDAP data is redacted in logs

  @security
  Scenario: LDAP connection uses secure protocol
    Given LDAP authentication is configured with LDAPS
    When the application connects to the LDAP server
    Then the connection uses encrypted protocol (LDAPS)
    And certificates are validated
    And credentials are transmitted securely

  @positive @update
  Scenario: LDAP user role is updated based on current group membership
    Given an LDAP user "jsmith" was provisioned with role "user"
    And the user is later added to AD admin group
    When the user logs in again via LDAP
    Then the user role is updated to "admin"
    And the user now has admin privileges

  @positive
  Scenario: Multiple LDAP users can login simultaneously
    Given multiple users exist in Active Directory
    When the following users login via LDAP:
      | username | expected_role |
      | user1    | user          |
      | user2    | user          |
      | admin1   | admin         |
    Then all users are authenticated successfully
    And each user is provisioned with correct role
    And all users can access the application
