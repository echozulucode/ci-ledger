@ui-ux @navigation @smoke
Feature: Navigation and Layout
  As a user
  I want consistent navigation across the application
  So that I can easily access different features

  Background:
    Given the user is logged in

  @positive
  Scenario: Top navigation bar displays on all pages
    When the user visits any application page:
      | page                |
      | Dashboard           |
      | My Items            |
      | API Tokens          |
      | Profile             |
    Then the top navigation bar is visible
    And the navigation is consistent across all pages

  @positive
  Scenario: Logo click returns user to dashboard
    Given the user is on the "My Items" page
    When the user clicks the application logo
    Then the user is redirected to the dashboard
    And the dashboard content is displayed

  @positive
  Scenario: Active page is highlighted in navigation
    When the user is on the "My Items" page
    Then the "My Items" navigation item is highlighted
    And other navigation items are not highlighted
    And the active state is visually distinct

  @positive @admin
  Scenario: Admin menu items are visible to admin users
    Given the admin is logged in
    When the admin views the navigation bar
    Then admin-specific menu items are displayed:
      | menu_item       |
      | Users           |
      | System Settings |
    And the admin can access these items

  @negative
  Scenario: Admin menu items are hidden from regular users
    Given a regular user is logged in
    When the user views the navigation bar
    Then admin-specific menu items are not visible
    And the user cannot access admin features via navigation

  @positive
  Scenario: User can logout from any page
    Given the user is on any application page
    When the user clicks the user menu
    And clicks "Logout"
    Then the user is logged out
    And redirected to the login page

  @positive
  Scenario: User menu shows current user information
    When the user clicks the user menu
    Then the menu displays the user's name
    And the menu displays the user's email
    And the menu provides logout option

  @positive
  Scenario: Navigation is responsive on mobile devices
    Given the user accesses the application on mobile device
    When the screen width is less than 768px
    Then the navigation collapses into hamburger menu
    And menu items are accessible via dropdown
    And the layout remains usable

  @positive
  Scenario: Breadcrumb navigation shows current location
    Given the user navigates to a nested page
    When the page loads
    Then breadcrumb navigation is displayed
    And shows the path: Home > Section > Current Page
    And each breadcrumb level is clickable

  @positive
  Scenario: Navigation items have clear labels
    When the user views the navigation
    Then all menu items have descriptive labels:
      | label         | destination        |
      | Dashboard     | Main dashboard     |
      | My Items      | User's items list  |
      | API Tokens    | Token management   |
      | Profile       | User profile       |

  @positive
  Scenario: Quick access menu for common actions
    When the user clicks the quick actions button
    Then common actions are displayed:
      | action           |
      | Create New Item  |
      | Generate API Key |
    And actions provide shortcuts to frequent tasks

  @positive
  Scenario: Footer displays on all pages
    When the user visits any page
    Then the footer is displayed at bottom
    And includes application version
    And includes copyright information
    And includes links to documentation

  @positive
  Scenario: Help link is accessible from navigation
    When the user views the navigation
    Then a "Help" or "Documentation" link is visible
    And clicking it opens help documentation
    And help is context-sensitive when possible

  @accessibility
  Scenario: Navigation is keyboard accessible
    When the user navigates using Tab key
    Then navigation items receive focus in logical order
    And focused items are visually indicated
    And Enter key activates navigation items
    And the navigation is fully keyboard operable

  @accessibility
  Scenario: Navigation has proper ARIA labels
    When the navigation is rendered
    Then proper ARIA landmarks are used
    And navigation has role="navigation"
    And menu items have appropriate ARIA attributes
    And screen readers can navigate effectively

  @positive
  Scenario: Current page is indicated in browser title
    When the user visits "My Items" page
    Then the browser title shows "My Items - Application Name"
    And the title updates on each page change
    And browser tabs are easily identifiable

  @positive
  Scenario: Navigation search allows quick page access
    When the user types in navigation search
    Then matching pages are suggested
    And user can quickly jump to any page
    And search includes keyboard shortcuts

  @positive
  Scenario: Notification badge shows unread items
    Given the user has unread notifications
    When the user views the navigation
    Then a notification badge is displayed
    And the badge shows unread count
    And clicking opens notifications panel
