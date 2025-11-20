# Gherkin Style Guide

This style guide defines the conventions for writing feature files in this project.

## File Organization

### Naming Convention

- **Pattern**: `##-descriptive-name.feature`
- **Example**: `01-user-registration.feature`, `02-user-login.feature`
- **Numbers**: Sequential within each category directory
- **Names**: Lowercase, hyphen-separated, descriptive

### Directory Structure

- Group related features by functional area
- Keep directories focused (5-10 features per directory)
- Use clear, consistent directory names

## Feature Structure

### Feature Header

```gherkin
@primary-tag @secondary-tag
Feature: Clear Feature Name
  As a [specific role]
  I want to [perform action]
  So that [achieve benefit]
```

**Guidelines**:
- Use 1-3 relevant tags
- Feature name: Title case, concise (2-5 words)
- User story format: Specifies role, action, and value
- Keep description brief (3 lines max)

### Background

```gherkin
Background:
  Given the application is running
  And the user is authenticated
```

**When to Use**:
- Common setup for ALL scenarios in the feature
- Limit to 2-3 steps maximum
- No assertions in Background
- Avoid if only 1-2 scenarios need it

**When NOT to Use**:
- Don't repeat across features (use step definitions)
- Don't include test data specific to one scenario
- Don't perform actions that change state

## Scenario Writing

### Basic Structure

```gherkin
@scenario-specific-tag
Scenario: Descriptive behavior and outcome
  Given [precondition]
  And [additional precondition]
  When [single action]
  Then [expected result]
  And [additional verification]
```

### Scenario Titles

**Good Examples**:
- ✅ `Successful login with valid credentials`
- ✅ `Registration fails with existing email`
- ✅ `Admin can view all users`
- ✅ `Expired token is rejected`

**Bad Examples**:
- ❌ `Login` (too vague)
- ❌ `Test that user can login successfully when they enter valid email and password` (too long)
- ❌ `User clicks login button` (implementation detail)
- ❌ `Should login` (use imperative, not conditional)

**Rules**:
- Start with subject and action
- Include outcome when it adds clarity
- Use present tense
- Keep under 80 characters
- Be specific but concise

### Step Guidelines

#### Given (Preconditions)

Establishes context and initial state.

```gherkin
Given the user is logged in as an admin
Given a user exists with email "test@example.com"
Given the database contains 10 items
Given LDAP authentication is enabled
```

**Rules**:
- Use past tense or present state
- Set up data and state
- No user actions
- Can have multiple Given/And steps

#### When (Actions)

Single action that triggers the behavior being tested.

```gherkin
When the user logs in with valid credentials
When the user creates a new item
When the admin deactivates the user account
When an API request is made with an expired token
```

**Rules**:
- **ONE When per scenario** (critical rule)
- Use present tense
- Describe user action, not UI interaction
- Keep abstract (no "clicks button" or "enters text in field")

#### Then (Outcomes)

Expected results and verifications.

```gherkin
Then the user is authenticated successfully
And a JWT token is returned
And the user is redirected to the dashboard
And the token contains the user ID
```

**Rules**:
- Use present or passive tense
- Can have multiple Then/And steps
- State observable outcomes
- Avoid implementation details

### Declarative vs Imperative

**Declarative (Preferred)**: Describes WHAT happens

```gherkin
✅ When the user registers with valid information
✅ Then the account is created successfully
✅ Given the user has admin privileges
```

**Imperative (Avoid)**: Describes HOW it happens

```gherkin
❌ When the user clicks the "Register" button
❌ And enters "test@example.com" in the email field
❌ And enters "password123" in the password field
❌ And clicks "Submit"
```

**Exception**: Use imperative style only when testing specific UI interactions is the goal.

## Data Handling

### Inline Data

For single values:

```gherkin
When the user logs in with email "test@example.com"
Then the response contains message "Login successful"
```

### Data Tables

For structured data:

```gherkin
Given the following users exist:
  | email              | full_name  | role  |
  | admin@example.com  | Admin User | admin |
  | user@example.com   | Test User  | user  |
```

**Rules**:
- Use for 2+ related fields
- Align columns with pipes
- Keep tables focused (5-7 columns max)
- Use clear, concise headers

### Scenario Outlines

For parameterized scenarios:

```gherkin
Scenario Outline: Password validation
  When the user registers with password "<password>"
  Then registration <result>

  Examples:
    | password     | result  |
    | weak         | fails   |
    | StrongP@ss1  | succeeds|
    | 12345678     | fails   |
```

**When to Use**:
- Testing same behavior with different data
- Multiple similar test cases
- Boundary testing

**When NOT to Use**:
- Different behaviors (write separate scenarios)
- Only 1-2 examples (use regular scenario)

## Language and Perspective

### Perspective

**Use third-person** for clarity:

```gherkin
✅ Given the user is logged in
✅ When the admin creates a new user
✅ Then the system sends a notification
```

**Avoid first-person**:

```gherkin
❌ Given I am logged in
❌ When I create a new user
```

### Tense

- **Given**: Present perfect or present state
  - "Given the user has logged in"
  - "Given a user exists"
- **When**: Present tense
  - "When the user logs in"
  - "When the admin updates the setting"
- **Then**: Present tense for assertions
  - "Then the user is authenticated"
  - "Then an error message is displayed"

### Actors

Be specific about roles:

```gherkin
✅ Given the admin user is logged in
✅ When a regular user attempts to access admin features
✅ Then the authenticated user sees their profile
```

### Avoid

- Ambiguous pronouns: "they", "it", "their"
- Technical jargon: "HTTP 401", "SQL query", "DOM element"
- Passive voice when active is clearer

## Scenario Length

### Target

- **3-5 steps per scenario** (ideal)
- **7 steps maximum** (including And/But)
- **Each step < 120 characters**

### If Scenario is Too Long

1. **Split into multiple scenarios**
   ```gherkin
   # Instead of one long scenario
   Scenario: User completes registration and logs in and creates item
   
   # Write two focused scenarios
   Scenario: User completes registration
   Scenario: Logged-in user creates item
   ```

2. **Use Background for common setup**
3. **Create helper steps in step definitions**
4. **Consider if scenario is testing multiple behaviors**

## Tags

### Purpose

- **Organization**: Group related features
- **Execution**: Run specific subsets of tests
- **Documentation**: Indicate test type or priority

### Tag Hierarchy

```gherkin
@authentication @security @smoke    # Feature-level tags
Feature: User Login
  
  @positive                         # Scenario-level tag
  Scenario: Successful login
  
  @negative @security               # Scenario-level tags
  Scenario: Login fails with invalid credentials
```

### Standard Tags

- **Functional Areas**: `@authentication`, `@user-management`, `@api`
- **Test Types**: `@smoke`, `@regression`, `@integration`
- **Behavior**: `@positive`, `@negative`, `@edge-case`
- **Priority**: `@critical`, `@high`, `@medium`, `@low`
- **Status**: `@wip` (work in progress), `@skip`, `@manual`

### Tagging Rules

- Use lowercase, hyphen-separated
- Apply 2-4 tags per feature
- Apply 1-2 tags per scenario
- Be consistent across features
- Remove temporary tags before commit

## Comments

```gherkin
# This is a comment
# Use sparingly - the Gherkin should be self-explanatory

Feature: User Login
  # TODO: Add LDAP authentication scenarios
  
  Scenario: Successful login
    Given the user exists
    # This step verifies authentication
    When the user logs in
    Then the user is authenticated
```

**Guidelines**:
- Use comments for TODOs and context only
- Don't explain obvious steps
- Remove outdated comments
- Prefer clear Gherkin over comments

## Common Mistakes to Avoid

### ❌ Multiple When Steps

```gherkin
# WRONG - Tests two behaviors
Scenario: User creates and deletes item
  When the user creates an item
  When the user deletes the item
  Then the item no longer exists
```

**Fix**: Split into two scenarios

### ❌ Implementation Details

```gherkin
# WRONG - Too technical
When the user sends a POST request to /api/users
Then the response status code is 201
And the database record is inserted
```

**Fix**: Use business language
```gherkin
When the user creates a new account
Then the account is created successfully
And the user can log in
```

### ❌ Vague Scenarios

```gherkin
# WRONG - Not specific
Scenario: User management
  When the admin manages users
  Then it works
```

**Fix**: Be specific
```gherkin
Scenario: Admin activates deactivated user account
  Given a user account is deactivated
  When the admin activates the user account
  Then the user can log in successfully
```

### ❌ Assertions in Given

```gherkin
# WRONG - Given should not verify
Given the user is logged in
And the response is 200 OK
```

**Fix**: Assertions belong in Then
```gherkin
Given the user is logged in
When the user views their profile
Then the profile is displayed successfully
```

## Examples

### Good Feature File

```gherkin
@authentication @security @smoke
Feature: User Login
  As a registered user
  I want to log in with my credentials
  So that I can access my account

  Background:
    Given the application is running
    And a user exists with email "test@example.com"

  @positive
  Scenario: Successful login with valid credentials
    When the user logs in with correct credentials
    Then the user is authenticated
    And a session token is issued
    And the user is redirected to the dashboard

  @negative @security
  Scenario: Login fails with incorrect password
    When the user attempts to login with incorrect password
    Then authentication fails
    And an error message is displayed
    And no session token is issued

  @negative
  Scenario: Login fails with non-existent account
    When the user attempts to login with email "nobody@example.com"
    Then authentication fails with error "Invalid credentials"
```

## Review Checklist

Before committing a feature file, verify:

- [ ] Feature has clear user story (As/I want/So that)
- [ ] Each scenario has exactly one When step
- [ ] Steps are declarative (what, not how)
- [ ] No implementation details mentioned
- [ ] Scenarios are 3-7 steps each
- [ ] Step text is under 120 characters
- [ ] Appropriate tags are applied
- [ ] Data tables are well-formatted
- [ ] Background is truly common to all scenarios
- [ ] Scenario titles clearly describe behavior
- [ ] Language is clear and consistent
- [ ] No technical jargon or UI element names

## References

- BDD Documentation Plan: `docs/ai/plan-002-bdd-documentation.md`
- Best Practices Document: `docs/bdd/Best Practices for Writing Gherkin BDD Feature Files.pdf`
- Cucumber Documentation: https://cucumber.io/docs/gherkin/
- SpecFlow Best Practices: https://specflow.org/learn/gherkin/

---

**Version**: 1.0  
**Last Updated**: 2025-11-01
