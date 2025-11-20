@ui-ux @loading @error-handling
Feature: Loading and Error States
  As a user
  I want clear feedback during loading and errors
  So that I understand what the application is doing

  @positive
  Scenario: Loading spinner displays during API calls
    When the user triggers an action that calls the API
    Then a loading spinner is displayed immediately
    And indicates the action is in progress
    And prevents user confusion about whether action started

  @positive
  Scenario: Disabled state prevents double submission
    When the user submits a form
    Then the submit button becomes disabled
    And shows visual disabled state
    And prevents accidental double-submission
    And re-enables after response is received

  @positive
  Scenario: Error message displays on API failure
    When an API call fails with error response
    Then a clear error message is displayed
    And explains what went wrong
    And suggests how to resolve the issue
    And provides option to retry if appropriate

  @positive
  Scenario: Empty state displays when no data exists
    Given the user has no items in their list
    When the user views the items page
    Then an empty state graphic is displayed
    And a message explains "No items yet"
    And a prominent "Create Item" button is shown
    And guides user to take action

  @positive
  Scenario: Loading skeleton shows content structure
    When a page is loading
    Then skeleton placeholders show expected content structure
    And match the layout of actual content
    And provide visual continuity
    And reduce perceived loading time

  @positive
  Scenario: Error toast shows temporary error notification
    When a non-critical error occurs
    Then an error toast notification appears
    And displays for 5 seconds
    And can be manually dismissed
    And doesn't block page functionality

  @positive
  Scenario: Inline error shows field-specific problems
    When a form field has validation error
    Then an inline error message appears below field
    And describes the specific problem
    And remains visible until corrected
    And is associated with the field for accessibility

  @positive
  Scenario: Global error page for critical failures
    When a critical error occurs (500, network error)
    Then a full-page error message is displayed
    And explains the situation in user-friendly terms
    And provides action buttons (Retry, Home)
    And error details are logged for debugging

  @positive
  Scenario: 404 page for not found resources
    When the user navigates to non-existent page
    Then a custom 404 page is displayed
    And indicates the page was not found
    And provides navigation to valid pages
    And maintains application branding

  @positive
  Scenario: Network error is handled gracefully
    When network connection is lost during API call
    Then a network error message is displayed
    And explains connection problem
    And offers option to retry
    And doesn't show technical error details

  @positive
  Scenario: Timeout error provides clear feedback
    When an API request times out
    Then a timeout error message is displayed
    And explains the request took too long
    And offers to retry the operation
    And suggests checking connection if repeated

  @positive
  Scenario: Loading state shows progress for long operations
    Given an operation takes more than 5 seconds
    When the operation is in progress
    Then a progress indicator is displayed
    And shows percentage if possible
    And provides estimated time if available
    And keeps user informed

  @positive
  Scenario: Optimistic UI updates improve perceived performance
    When the user creates or updates an item
    Then the UI updates immediately
    And shows the change before API confirms
    And rolls back if API call fails
    And provides smooth user experience

  @positive
  Scenario: Partial failure is communicated clearly
    When batch operation partially fails
    Then the UI indicates which items succeeded
    And which items failed
    And provides error details for failures
    And allows retry of failed items only

  @positive
  Scenario: Loading state doesn't block entire application
    When one section is loading
    Then only that section shows loading state
    And other sections remain interactive
    And user can navigate away if desired
    And loading doesn't freeze the application

  @positive
  Scenario: Retry mechanism for failed requests
    When an API request fails
    Then a "Retry" button is provided
    And clicking retry attempts the request again
    And loading state is shown during retry
    And success/failure is communicated

  @accessibility
  Scenario: Loading state is announced to screen readers
    When loading state begins
    Then ARIA live region announces "Loading"
    And screen reader users are informed
    And when loading completes, "Loaded" is announced

  @accessibility
  Scenario: Error messages are accessible
    When an error occurs
    Then error has appropriate ARIA role="alert"
    And is announced to screen readers
    And is programmatically associated with relevant element
    And can be navigated to via keyboard

  @positive
  Scenario: Success feedback confirms completed actions
    When an action completes successfully
    Then positive feedback is displayed
    And uses green color or checkmark icon
    And message confirms what happened
    And auto-dismisses after appropriate time

  @positive
  Scenario: Background tasks show unobtrusive status
    When a background task is running
    Then a subtle progress indicator is shown
    And doesn't interrupt user workflow
    And completion is notified when done
    And errors are surfaced appropriately

  @positive
  Scenario: Connection status indicator
    When network connectivity changes
    Then connection status is indicated
    And shows "Offline" banner when disconnected
    And shows "Back online" when reconnected
    And queues actions for retry when back online
