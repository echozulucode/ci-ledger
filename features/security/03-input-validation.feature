@security @validation @smoke
Feature: Input Validation and Injection Prevention
  As the system
  I want to validate and sanitize all inputs
  So that the application is protected from malicious data

  Background:
    Given the application has input validation enabled

  @security
  Scenario: SQL injection attempts are prevented
    When an API request includes SQL injection in email field:
      """
      admin' OR '1'='1
      """
    Then the input is rejected as invalid
    And the error indicates "Invalid email format"
    And no database query is executed with malicious input

  @security
  Scenario: XSS script injection is sanitized
    When a user creates an item with title containing script:
      """
      <script>alert('XSS')</script>
      """
    Then the input is sanitized or rejected
    And the script is not stored as-is
    And the script is not executed when displayed

  @security
  Scenario: Email format is validated
    When a user registers with invalid email "<script>@test.com"
    Then registration fails with error "Invalid email format"
    And the validation uses proper email regex
    And no account is created

  @security
  Scenario Outline: Email validation rules
    When a user provides email "<email>"
    Then validation result is "<result>"

    Examples:
      | email                   | result  |
      | valid@example.com       | valid   |
      | user.name@domain.co.uk  | valid   |
      | user+tag@example.com    | valid   |
      | @example.com            | invalid |
      | user@                   | invalid |
      | user email@test.com     | invalid |
      | user@domain            | valid   |
      | <script>@test.com       | invalid |

  @security
  Scenario: Required fields are enforced
    When a user attempts to create item without required field "title"
    Then validation fails with error "Title is required"
    And the request is rejected before database access
    And no partial data is stored

  @security
  Scenario: Data type validation prevents errors
    When an API request sends string for numeric field
    Then validation fails with error "Invalid data type"
    And type coercion is not silently applied
    And explicit type matching is required

  @security
  Scenario: Maximum length is enforced for text fields
    When a user provides a title with 1000 characters
    Then validation checks the maximum allowed length
    And excessively long inputs are rejected
    And buffer overflow attacks are prevented

  @security
  Scenario: Special characters are handled safely
    When a user creates item with title containing:
      """
      Item with "quotes" and 'apostrophes' & symbols
      """
    Then the input is accepted
    And special characters are properly escaped
    And no SQL injection occurs
    And the data is stored and retrieved correctly

  @security
  Scenario: Path traversal attempts are blocked
    When an API request includes path traversal in parameter:
      """
      ../../etc/passwd
      """
    Then the input is rejected
    And file system access is prevented
    And the error does not reveal system information

  @security
  Scenario: Command injection is prevented
    When an input field includes shell commands:
      """
      test; rm -rf /
      """
    Then the input is validated and rejected
    And command execution is prevented
    And the system remains secure

  @security
  Scenario: HTML entities are properly handled
    When a user inputs text with HTML entities:
      """
      &lt;script&gt;alert('test')&lt;/script&gt;
      """
    Then the entities are properly encoded
    And XSS attacks are prevented
    And the text is safely displayed

  @security
  Scenario: Integer overflow is prevented
    When an API request provides extremely large number
    Then the value is validated against acceptable range
    And overflow attempts are rejected
    And appropriate error message is returned

  @security
  Scenario: Boolean values are strictly validated
    When an API field expects boolean
    And a string "true" is provided instead of true
    Then validation enforces strict type checking
    And the request may be rejected based on API design
    And type confusion attacks are prevented

  @security
  Scenario: Null and undefined values are handled
    When an API request omits optional fields
    Then null values are handled safely
    And no null pointer exceptions occur
    And default values are applied where appropriate

  @security
  Scenario: Array inputs are validated
    When an API endpoint expects array of strings
    And the input includes non-string elements
    Then each array element is validated
    And invalid elements cause rejection
    And partial processing is prevented

  @security
  Scenario: Nested object validation works recursively
    When an API request includes nested objects
    Then validation applies to all levels
    And deeply nested malicious data is caught
    And all fields are validated regardless of depth

  @security
  Scenario: File upload validation (if applicable)
    When a user uploads a file
    Then the file type is validated
    And the file size is checked
    And malicious files are rejected
    And safe file handling practices are followed

  @security
  Scenario: UUID format is validated
    When an API endpoint expects UUID parameter
    And a non-UUID value is provided
    Then validation fails with error "Invalid UUID format"
    And the request is rejected
    And no database query with invalid UUID occurs

  @security
  Scenario: Date format is validated
    When an API request includes date field
    And the date is in invalid format
    Then validation fails with clear error
    And accepted date formats are documented
    And no date parsing errors occur

  @security
  Scenario: URL validation prevents malicious links
    When a user provides URL input
    Then the URL format is validated
    And dangerous schemes like javascript: are rejected
    And SSRF attacks are prevented
    And only safe protocols are allowed

  @security
  Scenario: Whitespace is handled appropriately
    When a user provides input with leading/trailing whitespace
    Then the whitespace is trimmed where appropriate
    And empty strings after trimming are caught
    And validation occurs on cleaned input

  @security
  Scenario: Case sensitivity is handled consistently
    When email "User@Example.COM" is provided
    Then case handling follows application rules
    And email uniqueness checks are case-insensitive
    And stored email case is normalized
