@system-admin @ldap @configuration
Feature: LDAP Configuration Management
  As a system administrator
  I want to configure and test LDAP settings
  So that LDAP authentication works correctly

  Background:
    Given the admin is logged in

  @positive @admin
  Scenario: Admin views LDAP configuration (redacted)
    When the admin views LDAP configuration
    Then LDAP settings are displayed
    And sensitive values are redacted:
      | setting              | display_format     |
      | ldap_bind_password   | ********           |
      | ldap_server          | ldaps://server.com |
      | ldap_base_dn         | displayed          |
      | ldap_user_search     | displayed          |
    And configuration source is indicated (env variables)

  @positive @admin
  Scenario: LDAP configuration is loaded from environment variables
    When the application starts
    Then LDAP settings are read from environment:
      | variable                    | purpose                |
      | LDAP_SERVER                 | Server URL             |
      | LDAP_BIND_DN                | Bind credentials       |
      | LDAP_BIND_PASSWORD          | Bind password          |
      | LDAP_USER_BASE_DN           | User search base       |
      | LDAP_GROUP_BASE_DN          | Group search base      |
      | LDAP_USER_SEARCH_FILTER     | User search filter     |
      | LDAP_ADMIN_GROUPS           | Admin group mapping    |
    And settings are validated on startup

  @positive @admin
  Scenario: LDAP group mappings are configurable
    When the admin views group mappings
    Then configured mappings are displayed:
      | ad_group       | application_role |
      | IntranetAdmins | admin            |
      | IntranetUsers  | user             |
    And mappings determine role assignment
    And can be updated via environment variables

  @positive @admin
  Scenario: Admin can test LDAP connection
    When the admin clicks "Test LDAP Connection"
    Then a connection test is performed
    And the result indicates success or failure
    And connection time is displayed
    And detailed error message shown if failed

  @positive @admin
  Scenario: LDAP test connection validates configuration
    When the admin tests LDAP connection
    Then the test verifies:
      | check                    | validated |
      | Server is reachable      | yes       |
      | Bind credentials work    | yes       |
      | Base DN is valid         | yes       |
      | Search filter is correct | yes       |
    And each validation result is reported

  @negative @admin
  Scenario: LDAP connection test fails with invalid credentials
    Given LDAP bind password is incorrect
    When the admin tests LDAP connection
    Then the test fails
    And error message indicates authentication failed
    And suggests checking bind credentials
    And no sensitive information is logged

  @negative @admin
  Scenario: LDAP connection test fails when server unreachable
    Given LDAP server is not accessible
    When the admin tests LDAP connection
    Then the test fails with timeout
    And error indicates server could not be reached
    And suggests checking network/firewall settings
    And displays connection attempt duration

  @positive @admin
  Scenario: Admin can test LDAP user search
    When the admin tests LDAP with username "testuser"
    Then the search is performed
    And result indicates if user was found
    And user's DN is displayed
    And retrieved attributes are shown
    And helps validate search configuration

  @positive @admin
  Scenario: Admin can test LDAP group membership
    When the admin tests group membership for user "testuser"
    Then the user's groups are retrieved
    And group list is displayed
    And indicates which groups grant admin role
    And helps validate group mappings

  @security @admin
  Scenario: LDAP configuration is never exposed to regular users
    Given a regular user is logged in
    When the user attempts to access LDAP configuration
    Then access is denied with status 403
    And no configuration information is revealed

  @security @admin
  Scenario: LDAP passwords are never returned in API
    When the admin queries LDAP configuration via API
    Then password fields are redacted in response
    And no plaintext passwords are transmitted
    And only masked values are shown

  @positive @admin
  Scenario: LDAP configuration validation on startup
    When the application starts with LDAP enabled
    Then LDAP configuration is validated
    And missing required settings cause startup warning
    And invalid values are logged
    And application indicates if LDAP is unavailable

  @positive @admin
  Scenario: Admin can view LDAP search filters
    When the admin views LDAP configuration
    Then user search filter is displayed
    And group search filter is displayed
    And filter syntax is explained
    And examples are provided

  @positive @admin
  Scenario: LDAP SSL certificate validation can be configured
    When LDAP is configured with LDAPS
    Then SSL certificate validation setting is shown
    And admin can see if validation is enabled
    And can configure via environment variable
    And security implications are documented

  @positive @admin
  Scenario: LDAP timeout settings are configurable
    When the admin views LDAP configuration
    Then connection timeout setting is displayed
    And search timeout setting is displayed
    And values can be adjusted via environment
    And defaults are reasonable (5-10 seconds)

  @positive @admin
  Scenario: LDAP user attribute mapping is documented
    When the admin views LDAP configuration
    Then attribute mappings are displayed:
      | ldap_attribute | application_field |
      | mail           | email             |
      | displayName    | full_name         |
      | sAMAccountName | username          |
    And mappings can be customized via environment

  @positive @admin
  Scenario: Admin can disable LDAP authentication
    When LDAP_ENABLED environment variable is set to false
    Then LDAP authentication is disabled
    And only local authentication is available
    And existing LDAP users cannot login via LDAP
    And local users can still authenticate

  @positive @admin
  Scenario: LDAP configuration changes require restart
    When LDAP environment variables are changed
    Then a restart is required for changes to take effect
    And current configuration remains active until restart
    And admin is informed about restart requirement

  @monitoring @admin
  Scenario: LDAP usage statistics are available
    When the admin views LDAP statistics
    Then number of LDAP authentications is displayed
    And success/failure rate is shown
    And helps monitor LDAP integration health
    And identifies if LDAP is being used

  @positive @admin
  Scenario: LDAP error logs are accessible to admin
    When LDAP authentication errors occur
    Then errors are logged with details
    And admin can view LDAP-specific logs
    And logs include timestamp and error type
    And help troubleshoot authentication issues

  @security @admin
  Scenario: LDAP bind credentials have restricted permissions
    When LDAP bind account is configured
    Then the account has minimal required permissions
    And can only search users and groups
    And cannot modify Active Directory
    And follows principle of least privilege

  @positive @admin
  Scenario: Multiple LDAP servers can be configured for redundancy
    When LDAP configuration includes multiple servers
    Then failover to backup servers is supported
    And each server is tried in order
    And improves LDAP availability
    And reduces authentication failures
