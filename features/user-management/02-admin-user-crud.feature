@user-management @admin @crud @smoke
Feature: Admin User CRUD Operations
  As an administrator
  I want to manage user accounts
  So that I can control access to the application

  Background:
    Given the admin is logged in

  @positive @admin
  Scenario: Admin views list of all users
    Given the following users exist:
      | email              | full_name  | role  | is_active |
      | user1@example.com  | User One   | user  | true      |
      | user2@example.com  | User Two   | user  | false     |
      | admin@example.com  | Admin User | admin | true      |
    When the admin views the user list
    Then all users are displayed
    And the list includes email, full name, role, and status

  @positive @admin
  Scenario: Admin creates a new user
    When the admin creates a user with:
      | email             | full_name   | password    | role |
      | new@example.com   | New User    | SecureP@ss1 | user |
    Then the user is created successfully
    And the user can log in with provided credentials
    And the user has role "user"

  @positive @admin
  Scenario: Admin updates user information
    Given a user exists with email "user@example.com"
    When the admin updates the user's full name to "Updated Name"
    Then the user information is updated successfully
    And the change is reflected in the user list

  @positive @admin
  Scenario: Admin activates deactivated user account
    Given a user exists with email "user@example.com" and is_active "false"
    When the admin activates the user account
    Then the user account becomes active
    And the user can log in

  @positive @admin
  Scenario: Admin deactivates active user account
    Given a user exists with email "user@example.com" and is_active "true"
    When the admin deactivates the user account
    Then the user account becomes inactive
    And the user cannot log in
    And existing sessions remain valid until expiration

  @positive @admin
  Scenario: Admin deletes user account
    Given a user exists with email "obsolete@example.com"
    When the admin deletes the user account
    Then the user is removed from the system
    And the user can no longer log in
    And the email becomes available for registration

  @positive @admin @authorization
  Scenario: Admin assigns admin role to user
    Given a user exists with email "user@example.com" and role "user"
    When the admin changes the user's role to "admin"
    Then the role is updated successfully
    And the user has admin privileges
    And the user can access admin endpoints

  @positive @admin @authorization
  Scenario: Admin revokes admin role from user
    Given a user exists with email "oldadmin@example.com" and role "admin"
    When the admin changes the user's role to "user"
    Then the role is updated successfully
    And the user loses admin privileges
    And the user cannot access admin endpoints

  @negative
  Scenario: Regular user cannot access user management
    Given a regular user is logged in
    When the user attempts to view the user list
    Then access is denied with status code 403
    And an error message "Insufficient permissions" is displayed

  @negative
  Scenario: Regular user cannot create users
    Given a regular user is logged in
    When the user attempts to create a new user
    Then access is denied
    And no user is created

  @negative
  Scenario: Regular user cannot modify other users
    Given a regular user "user1@example.com" is logged in
    And another user "user2@example.com" exists
    When user1 attempts to update user2's information
    Then access is denied
    And user2's information remains unchanged

  @negative
  Scenario: Regular user cannot delete other users
    Given a regular user "user1@example.com" is logged in
    And another user "user2@example.com" exists
    When user1 attempts to delete user2
    Then access is denied
    And user2's account remains active

  @negative @admin
  Scenario: Admin cannot delete their own account
    When the admin attempts to delete their own account
    Then the operation fails with error "Cannot delete your own account"
    And the admin account remains active

  @negative @admin
  Scenario: Admin cannot deactivate their own account
    When the admin attempts to deactivate their own account
    Then the operation fails with error "Cannot deactivate your own account"
    And the admin account remains active

  @security @admin
  Scenario: Created user password is securely hashed
    When the admin creates a user with password "SecureP@ss1"
    Then the password is hashed using Argon2
    And the plaintext password is never stored or logged

  @positive @admin
  Scenario: Admin can reset user password
    Given a user exists with email "user@example.com"
    When the admin resets the user's password
    Then a new temporary password is generated
    And the user is notified
    And the user can log in with the temporary password

  @positive @admin
  Scenario: Admin views user details
    Given a user exists with email "user@example.com"
    When the admin views the user's details
    Then all user information is displayed:
      | field        | visible |
      | email        | yes     |
      | full_name    | yes     |
      | role         | yes     |
      | is_active    | yes     |
      | created_at   | yes     |
      | ldap_user    | yes     |
    And the password is not displayed

  @positive @admin
  Scenario: Admin can view user's API tokens
    Given a user exists with email "user@example.com"
    And the user has 2 active API tokens
    When the admin views the user's details
    Then the API token count is displayed
    And the admin can see token metadata

  @negative @admin
  Scenario: Admin cannot create user with existing email
    Given a user exists with email "existing@example.com"
    When the admin attempts to create user with email "existing@example.com"
    Then creation fails with error "Email already registered"
    And no duplicate user is created
