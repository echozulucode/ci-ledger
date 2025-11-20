@security @password @smoke
Feature: Password Security
  As the system
  I want to enforce strong password requirements
  So that user accounts are protected from unauthorized access

  Background:
    Given the password security policy is enabled

  @security
  Scenario: Password must meet minimum length requirement
    When a user registers with password "Short1!"
    Then registration fails with error "Password must be at least 8 characters"
    And no account is created

  @security
  Scenario: Password must include uppercase letter
    When a user registers with password "lowercase123!"
    Then registration fails with error "Password must contain uppercase letter"
    And no account is created

  @security
  Scenario: Password must include lowercase letter
    When a user registers with password "UPPERCASE123!"
    Then registration fails with error "Password must contain lowercase letter"
    And no account is created

  @security
  Scenario: Password must include number
    When a user registers with password "NoNumberHere!"
    Then registration fails with error "Password must contain a number"
    And no account is created

  @security
  Scenario: Password must include special character
    When a user registers with password "NoSpecial123"
    Then registration fails with error "Password must contain special character"
    And no account is created

  @security
  Scenario Outline: Password validation rules
    When a user registers with password "<password>"
    Then registration result is "<result>"
    And the reason is "<reason>"

    Examples:
      | password          | result  | reason                            |
      | ValidP@ss123      | success | meets all requirements            |
      | short1!           | fail    | too short                         |
      | lowercase123!     | fail    | no uppercase                      |
      | UPPERCASE123!     | fail    | no lowercase                      |
      | NoNumbers!        | fail    | no number                         |
      | NoSpecial123      | fail    | no special character              |
      | VeryL0ng&Secure   | success | meets all requirements            |
      | C0mpl3x!Pass      | success | meets all requirements            |

  @security
  Scenario: Password is hashed with Argon2 in database
    Given a user registers with password "SecureP@ss123"
    When the account is created
    Then the password is stored using Argon2 hashing algorithm
    And the password hash starts with "$argon2"
    And the plaintext password is never stored

  @security
  Scenario: Password is never returned in API responses
    Given a user is logged in
    When the user requests their profile via API
    Then the response contains user information
    And the password field is not included
    And no password hash is exposed

  @security
  Scenario: Password hash is not exposed in error messages
    When a user attempts to login with wrong password
    Then the error message is generic "Invalid credentials"
    And no password hash information is revealed
    And no password hints are provided

  @security
  Scenario: Password is validated on registration
    When a user attempts to register
    Then password validation occurs before account creation
    And invalid passwords are rejected immediately
    And detailed validation errors are provided

  @security
  Scenario: Password is validated on password change
    Given a user is logged in
    When the user changes their password
    Then the new password is validated against policy
    And weak passwords are rejected
    And the old password remains in effect

  @security
  Scenario: Strong password is accepted
    When a user registers with password "MyStr0ng!Password#2024"
    Then the password is accepted
    And the account is created successfully
    And the password meets all security requirements

  @security
  Scenario: Password complexity is enforced for all users
    When admin creates a new user
    Then the password must meet the same requirements
    And no exceptions are allowed
    And admin cannot bypass password policy

  @security
  Scenario: Password hash uses unique salt per user
    Given user A registers with password "SameP@ss123"
    And user B registers with password "SameP@ss123"
    When the password hashes are compared
    Then the hashes are different
    And each user has a unique salt
    And rainbow table attacks are prevented

  @security
  Scenario: Password hashing is computationally expensive
    When a password is hashed
    Then the hashing process takes measurable time
    And brute force attacks are slowed down
    And the cost factor is appropriately configured

  @security
  Scenario: Old password hashes remain valid after algorithm update
    Given a user's password was hashed with previous settings
    When the user logs in
    Then authentication succeeds with old hash
    And the hash is upgraded on next password change

  @security
  Scenario: Password policy is documented for users
    When a user views the registration form
    Then password requirements are clearly displayed:
      | requirement              | displayed |
      | Minimum 8 characters     | yes       |
      | Uppercase letter         | yes       |
      | Lowercase letter         | yes       |
      | Number                   | yes       |
      | Special character        | yes       |

  @security
  Scenario: Password strength meter provides feedback
    When a user types a password in registration form
    Then a strength meter provides real-time feedback
    And weak passwords show red indicator
    And strong passwords show green indicator
    And specific improvement suggestions are shown

  @security
  Scenario: Common passwords are rejected
    When a user attempts to register with password "Password123!"
    Then registration should fail with warning about common password
    And the user is encouraged to choose unique password

  @security
  Scenario: Password is not logged in application logs
    Given a user logs in with password "SecureP@ss123"
    When authentication logs are examined
    Then the password is not present in logs
    And only authentication success/failure is logged
    And sensitive data is properly redacted
