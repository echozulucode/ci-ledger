@security @ldap @compliance
Feature: LDAP Security
  As the system administrator
  I want LDAP authentication to be secure
  So that Active Directory credentials are protected

  Background:
    Given LDAP authentication is configured

  @security
  Scenario: LDAP connection uses secure protocol
    When the application connects to LDAP server
    Then the connection uses LDAPS (LDAP over SSL/TLS)
    And the protocol is "ldaps://" not "ldap://"
    And credentials are transmitted encrypted

  @security
  Scenario: LDAP certificates are validated
    When establishing LDAP connection
    Then server certificates are validated
    And certificate chain is verified
    And self-signed certificates require explicit trust
    And man-in-the-middle attacks are prevented

  @security
  Scenario: LDAP credentials are not logged
    When a user authenticates via LDAP
    Then the user's password is never logged
    And LDAP bind credentials are not logged
    And logs contain only authentication success/failure
    And sensitive data is redacted

  @security
  Scenario: LDAP bind credentials are stored securely
    When the application starts
    Then LDAP bind credentials are loaded from environment
    And credentials are not hardcoded in source
    And credentials are not in version control
    And secrets management best practices are followed

  @security
  Scenario: LDAP connection failures don't expose sensitive information
    When LDAP server is unreachable
    Then the error message is generic "Authentication service unavailable"
    And no LDAP server details are exposed to users
    And no connection strings are revealed
    And detailed errors are logged securely for admins

  @security
  Scenario: LDAP group membership controls access
    Given LDAP group filtering is enabled
    And allowed groups are "IntranetUsers,IntranetAdmins"
    When a user not in allowed groups attempts login
    Then authentication fails
    And the user is denied access
    And group membership is verified before provisioning

  @security
  Scenario: LDAP queries are parameterized
    When LDAP search is performed for user
    Then the query uses parameterized filters
    And user input is properly escaped
    And LDAP injection attacks are prevented
    And special characters in usernames are handled safely

  @security
  Scenario: LDAP search filter prevents injection
    When a malicious username contains LDAP filter characters:
      """
      admin*)(objectClass=*
      """
    Then the input is sanitized
    And LDAP injection is prevented
    And only exact username match is searched

  @security
  Scenario: Failed LDAP authentication is logged
    When LDAP authentication fails for user "jsmith"
    Then the failure is logged with timestamp
    And the log includes username (but not password)
    And the log includes failure reason
    And repeated failures can trigger alerts

  @security
  Scenario: LDAP timeout prevents denial of service
    When LDAP server is slow to respond
    Then connection timeout is enforced
    And authentication does not hang indefinitely
    And the application remains responsive
    And timeout value is configurable

  @security
  Scenario: LDAP connection pool is secure
    When multiple users authenticate simultaneously
    Then LDAP connections are pooled safely
    And connection reuse does not leak credentials
    And each authentication uses fresh context
    And connection state is properly reset

  @security
  Scenario: LDAP user DN is properly constructed
    When searching for user in Active Directory
    Then the distinguished name is properly formatted
    And base DN is validated
    And search scope is restricted appropriately
    And entire directory is not exposed

  @security
  Scenario: LDAP attributes are validated
    When LDAP user attributes are retrieved
    Then only necessary attributes are requested
    And attribute values are validated before use
    And unexpected data types are handled
    And attribute injection is prevented

  @security
  Scenario: LDAP group names are validated
    When mapping LDAP groups to application roles
    Then group names are validated against whitelist
    And malicious group names are rejected
    And only configured groups grant access
    And group hierarchy is properly checked

  @security
  Scenario: LDAP anonymous bind is disabled
    When connecting to LDAP server
    Then anonymous binding is not allowed
    And bind credentials are always required
    And unauthenticated access is prevented

  @security
  Scenario: LDAP password policies are respected
    When an LDAP user authenticates
    Then Active Directory password policies apply
    And expired AD passwords are detected
    And users are prompted to update password in AD
    And application does not bypass AD policies

  @security
  Scenario: LDAP account lockout is handled
    When an LDAP user account is locked in AD
    Then authentication fails appropriately
    And the lockout status is detected
    And user is informed about account lockout
    And no application-side unlock is possible

  @security
  Scenario: LDAP disabled accounts are rejected
    When an LDAP user account is disabled in AD
    Then authentication fails
    And the disabled status is detected
    And no local account provisioning occurs
    And access is immediately revoked

  @security
  Scenario: LDAP SSL/TLS version is modern
    When establishing LDAPS connection
    Then TLS 1.2 or higher is required
    And older SSL/TLS versions are disabled
    And strong cipher suites are configured
    And secure connection parameters are enforced

  @security
  Scenario: LDAP connection settings are not exposed
    When an error occurs during LDAP authentication
    Then LDAP server hostname is not exposed to user
    And port numbers are not revealed
    And base DN is not disclosed
    And configuration remains confidential

  @security
  Scenario: LDAP health check protects credentials
    When admin checks LDAP health endpoint
    Then health status is reported (up/down)
    And no LDAP credentials are exposed
    And no sensitive configuration is returned
    And only connection status is disclosed

  @security
  Scenario: LDAP fallback to local auth is secure
    When LDAP server is unavailable
    And local authentication fallback is enabled
    Then local users can still authenticate
    And LDAP users cannot bypass LDAP with local password
    And authentication source is properly enforced
    And no privilege escalation occurs

  @security @compliance
  Scenario: LDAP authentication meets compliance requirements
    When LDAP authentication is used
    Then all authentication attempts are logged
    And user access is traceable
    And group membership changes are reflected
    And audit trail is maintained
    And compliance reports can be generated
