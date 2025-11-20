@system-admin @monitoring @health
Feature: Health Monitoring
  As a system administrator
  I want to monitor system health
  So that I can ensure the application is running properly

  @positive
  Scenario: Health endpoint reports system status
    When a request is made to the health endpoint
    Then the response status is 200
    And the response indicates system is healthy
    And includes application version
    And includes timestamp

  @positive
  Scenario: Health check includes database connectivity
    When the health endpoint is queried
    Then database connectivity is tested
    And database status is reported
    And response indicates if database is accessible
    And connection latency is included if available

  @positive @ldap
  Scenario: LDAP health check reports connection status
    Given LDAP authentication is configured
    When the health endpoint is queried
    Then LDAP connection status is tested
    And LDAP availability is reported
    And connection success/failure is indicated
    And no sensitive configuration is exposed

  @positive
  Scenario: Health check is unauthenticated
    When an unauthenticated request is made to health endpoint
    Then the request succeeds
    And basic health information is returned
    And allows monitoring systems to check status
    And no authentication is required

  @positive
  Scenario: Detailed health requires authentication
    When an authenticated admin requests detailed health
    Then comprehensive health information is returned
    And includes component statuses
    And shows detailed diagnostics
    And provides troubleshooting information

  @positive
  Scenario: Health check response format is consistent
    When the health endpoint is queried
    Then the response format is JSON
    And follows consistent schema
    And includes status field
    And includes timestamp field
    And monitoring tools can parse reliably

  @negative
  Scenario: Health endpoint reports degraded state
    Given database is slow to respond
    When the health endpoint is queried
    Then the response indicates "degraded" status
    And explains which component is degraded
    And provides relevant metrics
    And allows proactive investigation

  @negative
  Scenario: Health endpoint reports unhealthy state
    Given a critical component is unavailable
    When the health endpoint is queried
    Then the response status is 503 Service Unavailable
    And indicates system is unhealthy
    And identifies the failing component
    And monitoring systems can detect outage

  @positive
  Scenario: Health check includes response time metrics
    When the health endpoint is queried
    Then response time for each component is included
    And database query time is reported
    And LDAP connection time is reported
    And helps identify performance issues

  @positive
  Scenario: Health check has minimal performance impact
    When the health endpoint is queried frequently
    Then health checks execute quickly (< 1 second)
    And don't significantly load the database
    And don't impact application performance
    And can be called by monitoring tools repeatedly

  @positive
  Scenario: Health endpoint supports query parameters
    When health endpoint is called with ?check=database
    Then only database health is checked
    And response is faster for targeted checks
    And allows specific component monitoring
    And reduces overhead for frequent checks

  @positive
  Scenario: Health status includes uptime
    When the health endpoint is queried
    Then application uptime is included
    And indicates how long system has been running
    And helps track restart frequency
    And useful for operational monitoring

  @positive
  Scenario: Health check detects configuration issues
    Given a required environment variable is missing
    When the health endpoint is queried
    Then the response indicates configuration problem
    And lists the missing configuration
    And system reports unhealthy status
    And helps diagnose deployment issues

  @security
  Scenario: Health endpoint doesn't expose secrets
    When the health endpoint is queried
    Then no passwords are included in response
    And no API keys are exposed
    And no sensitive configuration is revealed
    And only non-sensitive status is reported

  @security
  Scenario: Health endpoint doesn't expose internal details
    When an unauthenticated health check is performed
    Then internal IP addresses are not exposed
    And file paths are not revealed
    And software versions are limited
    And information disclosure is minimized

  @positive
  Scenario: Health endpoint supports HEAD requests
    When a HEAD request is made to health endpoint
    Then response status indicates health
    And no body is returned
    And allows lightweight health checks
    And reduces bandwidth for monitoring

  @positive
  Scenario: Health check includes dependencies status
    When the health endpoint is queried with detailed flag
    Then status of all dependencies is reported:
      | dependency | checked |
      | Database   | yes     |
      | LDAP       | yes     |
      | File System| yes     |
    And each dependency has individual status

  @monitoring
  Scenario: Health metrics can be exported to monitoring systems
    When monitoring system queries health endpoint
    Then metrics are in format compatible with Prometheus/Grafana
    And can be scraped periodically
    And historical trends can be tracked
    And alerts can be configured based on metrics

  @positive
  Scenario: Readiness check indicates if app is ready
    When a readiness check is performed
    Then the response indicates if app can accept traffic
    And checks if database migrations are complete
    And verifies critical dependencies are available
    And orchestration systems can use for routing decisions

  @positive
  Scenario: Liveness check indicates if app is alive
    When a liveness check is performed
    Then the response indicates if app is running
    And returns quickly without external dependencies
    And orchestration systems can use for restart decisions
    And helps detect application hangs
