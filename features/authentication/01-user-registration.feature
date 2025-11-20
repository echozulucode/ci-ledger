@authentication @registration @smoke
Feature: User Registration
  As a new user
  I want to register for an account
  So that I can access the intranet application

  Background:
    Given the registration system is available

  @positive
  Scenario: Successful registration with valid credentials
    Given no user exists with email "newuser@example.com"
    When the user registers with the following information:
      | email               | full_name    | password     |
      | newuser@example.com | John Smith   | SecureP@ss1  |
    Then the user account is created successfully
    And the user is assigned the default "user" role
    And the user can log in with their credentials

  @negative
  Scenario: Registration fails with existing email
    Given a user already exists with email "existing@example.com"
    When the user attempts to register with email "existing@example.com"
    Then registration fails with error "Email already registered"
    And no new account is created

  @negative @security
  Scenario: Registration fails with weak password
    When the user attempts to register with password "weak"
    Then registration fails with password validation error
    And the error indicates password requirements
    And no account is created

  @negative
  Scenario Outline: Registration fails with invalid password
    When the user attempts to register with password "<password>"
    Then registration fails with password validation error
    And no account is created

    Examples:
      | password    | reason                    |
      | short       | too short                 |
      | nouppercase | no uppercase letter       |
      | NOLOWERCASE | no lowercase letter       |
      | NoNumber    | no number                 |
      | NoSpecial1  | no special character      |

  @negative
  Scenario Outline: Registration fails with invalid email format
    When the user attempts to register with email "<email>"
    Then registration fails with error "Invalid email format"
    And no account is created

    Examples:
      | email           |
      | invalid         |
      | @example.com    |
      | user@           |
      | user @email.com |

  @negative
  Scenario: Registration fails with missing required fields
    When the user attempts to register without providing email
    Then registration fails with error "Email is required"
    And no account is created

  @negative
  Scenario: Registration fails with missing full name
    When the user attempts to register without providing full name
    Then registration fails with error "Full name is required"
    And no account is created

  @security
  Scenario: Registered password is securely hashed
    Given the user registers with password "SecureP@ss1"
    When the user account is created
    Then the password is stored using Argon2 hashing
    And the plaintext password is never stored
    And the password hash is different from the original password

  @positive
  Scenario: Multiple users can register with different emails
    When the following users register successfully:
      | email                | full_name      | password     |
      | user1@example.com    | Alice Johnson  | SecureP@ss1  |
      | user2@example.com    | Bob Williams   | SecureP@ss2  |
      | user3@example.com    | Carol Davis    | SecureP@ss3  |
    Then all accounts are created successfully
    And each user can log in independently
