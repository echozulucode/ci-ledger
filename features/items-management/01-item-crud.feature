@items-management @crud @smoke
Feature: Item CRUD Operations
  As a user
  I want to manage my items
  So that I can organize and track my data

  Background:
    Given the user is logged in with email "user@example.com"

  @positive
  Scenario: User creates a new item
    When the user creates an item with:
      | title        | description           | status  |
      | My First Item| This is a test item   | active  |
    Then the item is created successfully
    And the item is assigned to the user
    And a success message is displayed
    And the item appears in the user's item list

  @positive
  Scenario: User views their own items
    Given the user has the following items:
      | title   | description    | status   |
      | Item 1  | Description 1  | active   |
      | Item 2  | Description 2  | inactive |
      | Item 3  | Description 3  | active   |
    When the user views their item list
    Then all their items are displayed
    And items show title, description, and status

  @positive
  Scenario: User updates their own item
    Given the user has an item with title "Original Title"
    When the user updates the item to:
      | title         | description       | status  |
      | Updated Title | New description   | active  |
    Then the item is updated successfully
    And a success message is displayed
    And the changes are reflected immediately

  @positive
  Scenario: User deletes their own item
    Given the user has an item with title "To Delete"
    When the user deletes the item
    And confirms the deletion
    Then the item is deleted successfully
    And a success message "Item deleted" is displayed
    And the item no longer appears in the list

  @negative
  Scenario: User cannot modify another user's item
    Given another user owns an item with ID "12345"
    When the user attempts to update that item
    Then access is denied with status 403
    And the error message is "Not authorized"
    And the item remains unchanged

  @negative
  Scenario: User cannot delete another user's item
    Given another user owns an item with ID "12345"
    When the user attempts to delete that item
    Then access is denied with status 403
    And the item is not deleted

  @negative
  Scenario: User cannot view another user's items
    Given another user "other@example.com" has items
    When the user views their own item list
    Then only the user's own items are displayed
    And the other user's items are not visible

  @positive @admin
  Scenario: Admin views all items regardless of owner
    Given the admin is logged in
    And multiple users have created items:
      | owner                | title      |
      | user1@example.com    | Item A     |
      | user2@example.com    | Item B     |
      | user3@example.com    | Item C     |
    When the admin views the item list
    Then all items from all users are displayed
    And the owner information is shown for each item

  @positive @admin
  Scenario: Admin can modify any user's item
    Given the admin is logged in
    And a user has an item with title "User Item"
    When the admin updates the item
    Then the update succeeds
    And the changes are saved

  @positive @admin
  Scenario: Admin can delete any user's item
    Given the admin is logged in
    And a user has an item with title "User Item"
    When the admin deletes the item
    Then the deletion succeeds
    And the item is removed

  @negative
  Scenario: Item creation fails with missing required fields
    When the user attempts to create an item without title
    Then creation fails with error "Title is required"
    And no item is created

  @negative
  Scenario: Item creation fails with invalid status
    When the user attempts to create an item with status "invalid"
    Then creation fails with error "Invalid status value"
    And no item is created

  @positive
  Scenario: User views single item details
    Given the user has an item with ID "123"
    When the user views the item details
    Then all item information is displayed:
      | field        | displayed |
      | title        | yes       |
      | description  | yes       |
      | status       | yes       |
      | created_at   | yes       |
      | updated_at   | yes       |
      | owner        | yes       |

  @positive
  Scenario: Item shows creation and update timestamps
    Given the user created an item 2 days ago
    And updated the item 1 day ago
    When the user views the item
    Then the creation timestamp shows "2 days ago"
    And the update timestamp shows "1 day ago"

  @positive
  Scenario: User filters items by status
    Given the user has items with various statuses:
      | title   | status   |
      | Item 1  | active   |
      | Item 2  | inactive |
      | Item 3  | active   |
    When the user filters by status "active"
    Then only active items are displayed:
      | title   |
      | Item 1  |
      | Item 3  |

  @positive
  Scenario: User searches items by title
    Given the user has multiple items
    When the user searches for "First"
    Then only items with "First" in title are displayed
    And the search is case-insensitive

  @positive
  Scenario: Empty state is shown when user has no items
    Given the user has no items
    When the user views their item list
    Then an empty state message is displayed
    And a "Create Item" button is prominently shown

  @positive
  Scenario: User receives confirmation before deleting item
    Given the user has an item
    When the user clicks delete
    Then a confirmation dialog appears
    And the dialog warns "This action cannot be undone"
    And the user must confirm to proceed

  @positive
  Scenario: Item deletion can be cancelled
    Given the user has an item
    When the user clicks delete
    And the confirmation dialog appears
    And the user cancels the operation
    Then the item remains unchanged
    And the item still appears in the list

  @positive
  Scenario: Items are paginated when list is long
    Given the user has 50 items
    When the user views their item list
    Then items are displayed in pages
    And pagination controls are available
    And the user can navigate between pages

  @positive
  Scenario: User sorts items by creation date
    Given the user has multiple items
    When the user sorts by creation date descending
    Then the newest items appear first
    And older items appear later
