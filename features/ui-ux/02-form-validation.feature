@ui-ux @forms @validation
Feature: Form Validation and Feedback
  As a user
  I want clear feedback on form inputs
  So that I can successfully complete forms

  Background:
    Given the user is on a form page

  @positive
  Scenario: Invalid form fields show error messages
    When the user enters invalid email "not-an-email"
    And moves focus away from the email field
    Then an error message "Invalid email format" is displayed
    And the field is highlighted in red
    And the error appears below the field

  @positive
  Scenario: Required fields show validation on blur
    When the user focuses on a required field
    And leaves the field empty
    And moves focus away
    Then an error message "This field is required" is displayed
    And the field is marked as invalid
    And submission is prevented until corrected

  @positive
  Scenario: Valid fields show success indicator
    When the user enters valid data in all fields
    Then valid fields show green checkmark
    And the form is ready for submission
    And no error messages are displayed

  @positive
  Scenario: Password strength meter displays in real-time
    When the user types in password field
    Then a strength meter is displayed
    And updates as the user types
    And shows weak/medium/strong indication
    And provides specific improvement hints

  @positive
  Scenario: Success toast appears after successful action
    When the user submits a valid form
    And the action completes successfully
    Then a success toast notification appears
    And displays message "Item created successfully"
    And auto-dismisses after 3 seconds
    And can be manually dismissed

  @positive
  Scenario: Error toast appears after failed action
    When the user submits a form
    And the server returns an error
    Then an error toast notification appears
    And displays the error message
    And remains visible until dismissed
    And has clear dismiss button

  @positive
  Scenario: Form validation occurs before submission
    Given the form has invalid fields
    When the user clicks submit button
    Then validation errors are displayed
    And form submission is prevented
    And focus moves to first invalid field
    And no API request is made

  @positive
  Scenario: Multiple validation errors are shown clearly
    Given the form has multiple invalid fields
    When validation occurs
    Then each invalid field shows its specific error
    And all errors are visible simultaneously
    And user can see all required corrections

  @positive
  Scenario: Validation messages are clear and helpful
    When a validation error occurs
    Then the error message is specific
    And explains what went wrong
    And provides guidance on how to fix it
    And uses plain language without jargon

  @positive
  Scenario: Field-level validation occurs on blur
    When the user completes typing in a field
    And moves to the next field
    Then the completed field is validated
    And immediate feedback is provided
    And user can correct errors immediately

  @positive
  Scenario: Form shows loading state during submission
    When the user submits a form
    And the request is processing
    Then a loading spinner is displayed
    And the submit button is disabled
    And button text changes to "Submitting..."
    And user cannot double-submit

  @positive
  Scenario: Disabled submit button prevents invalid submission
    Given the form has validation errors
    Then the submit button is disabled
    And the button has visual disabled state
    And tooltip explains why button is disabled
    And button enables when form becomes valid

  @positive
  Scenario: Form preserves data during validation
    When the user enters data in form fields
    And validation errors occur
    Then entered data is not lost
    And user can correct errors without re-entering
    And only invalid fields need correction

  @positive
  Scenario: Auto-complete suggestions improve input
    When the user types in email field
    Then browser autocomplete suggestions appear
    And previously used emails are suggested
    And user can quickly select from suggestions

  @positive
  Scenario: Inline help text assists users
    When the user views a form field
    Then helpful hint text is displayed below field
    And explains expected format or constraints
    And provides examples when helpful
    And updates based on user input

  @accessibility
  Scenario: Error messages are announced to screen readers
    When a validation error occurs
    Then the error is announced via ARIA live region
    And screen reader users receive immediate feedback
    And error messages are properly associated with fields

  @accessibility
  Scenario: Form labels are properly associated
    When the form is rendered
    Then each input has associated label
    And clicking label focuses the input
    And label text is clear and descriptive
    And required fields are properly indicated

  @positive
  Scenario: Confirmation required for destructive actions
    When the user attempts to delete data
    Then a confirmation dialog appears
    And clearly explains the consequence
    And requires explicit confirmation
    And allows cancellation

  @positive
  Scenario: Form can be reset to initial state
    Given the user has entered data in form
    When the user clicks "Reset" or "Cancel"
    Then form fields return to initial values
    And validation errors are cleared
    And user is prompted to confirm if data is unsaved

  @positive
  Scenario: Multi-step forms show progress indicator
    Given a form has multiple steps
    When the user navigates between steps
    Then a progress indicator shows current step
    And displays total number of steps
    And allows navigation to previous steps
    And validates current step before advancing

  @positive
  Scenario: Character counter shows remaining characters
    Given a field has maximum length constraint
    When the user types in the field
    Then a character counter is displayed
    And shows "X / 100 characters"
    And updates in real-time
    And warns when limit is approached
