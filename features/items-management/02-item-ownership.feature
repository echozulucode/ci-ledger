@items-management @authorization @ownership
Feature: Item Ownership and Permissions
  As the system
  I want to enforce item ownership rules
  So that users can only access their own data

  Background:
    Given user "alice@example.com" is logged in
    And user "bob@example.com" exists

  @security
  Scenario: Item is automatically assigned to creating user
    When alice creates an item with title "Alice's Item"
    Then the item owner is set to "alice@example.com"
    And the ownership is immutable
    And the owner field cannot be manually changed

  @security
  Scenario: User can only see their own items by default
    Given alice has created 3 items
    And bob has created 5 items
    When alice views the item list
    Then alice sees exactly 3 items
    And bob's items are not visible

  @negative @security
  Scenario: User cannot delete items they don't own
    Given bob has an item with ID "bob-item-123"
    When alice attempts to delete item "bob-item-123"
    Then access is denied with status 403
    And the error indicates "Not authorized to delete this item"
    And bob's item remains intact

  @negative @security
  Scenario: User cannot update items they don't own
    Given bob has an item with title "Bob's Item"
    When alice attempts to update bob's item
    Then access is denied with status 403
    And bob's item remains unchanged

  @negative @security
  Scenario: User cannot view another user's item details
    Given bob has an item with ID "bob-item-123"
    When alice attempts to view item "bob-item-123"
    Then access is denied with status 404
    And no item information is revealed
    And alice receives "Item not found" error

  @positive @admin
  Scenario: Admin can view and manage all items
    Given the admin is logged in
    And alice has 3 items
    And bob has 5 items
    When the admin views the item list
    Then the admin sees all 8 items
    And each item shows its owner
    And the admin can filter by owner

  @positive @admin
  Scenario: Admin can update any user's item
    Given the admin is logged in
    And alice has an item "Alice's Item"
    When the admin updates alice's item title to "Modified by Admin"
    Then the update succeeds
    And alice's item now shows "Modified by Admin"
    And the owner remains "alice@example.com"

  @positive @admin
  Scenario: Admin can delete any user's item
    Given the admin is logged in
    And alice has an item with ID "alice-item-123"
    When the admin deletes item "alice-item-123"
    Then the deletion succeeds
    And the item is removed from alice's list

  @security
  Scenario: Ownership cannot be transferred
    Given alice owns an item with ID "item-123"
    When alice attempts to change the owner to bob
    Then the operation fails
    And the owner remains "alice@example.com"
    And an error indicates "Owner cannot be changed"

  @security
  Scenario: Deleted user's items are handled appropriately
    Given alice has 5 items
    When alice's account is deleted by admin
    Then alice's items are either deleted or orphaned
    And the items are no longer accessible via alice's account

  @positive @admin
  Scenario: Admin can filter items by owner
    Given multiple users have created items
    When the admin filters items by owner "alice@example.com"
    Then only alice's items are displayed
    And items from other users are hidden

  @positive @admin
  Scenario: Admin can view item ownership history
    Given an item has been created and updated
    When the admin views the item details
    Then the original creator is displayed
    And modification history shows which admin made changes

  @security
  Scenario: API token inherits user ownership rules
    Given alice has a valid PAT
    And bob has items
    When an API request with alice's PAT attempts to access bob's items
    Then access is denied
    And ownership rules are enforced for PAT authentication

  @security
  Scenario: Item ID cannot be guessed to access other items
    Given bob has an item with sequential ID
    When alice attempts to access IDs around bob's item ID
    Then all unauthorized access attempts are denied
    And no information about item existence is leaked

  @positive
  Scenario: User sees item count for their items only
    Given alice has 10 items
    And bob has 20 items
    When alice views the dashboard
    Then the item count shows "10 items"
    And bob's items are not included in the count

  @positive
  Scenario: Multiple users can create items with same title
    Given alice creates an item with title "My Item"
    When bob creates an item with title "My Item"
    Then both items are created successfully
    And each user sees only their own "My Item"
    And ownership distinguishes the items
