@items-management @items @api
Feature: Item search and filtering
  As a user
  I want to find items by filtering and search
  So that I can quickly locate relevant records

  Background:
    Given the application is running
    And the user is logged in with email "user@example.com"

  @smoke @positive
  Scenario: Filter items by status and search term
    Given the user has the following items:
      | title                | description           | status  |
      | Release checklist    | Deploy plan draft     | active  |
      | Archive document     | Old release notes     | inactive|
      | Deployment prep      | Prepare deployment    | active  |
    When the user filters items by status "active"
    And the user filters items by search term "deploy"
    Then only matching items are shown
    And each result shows title, description, and status

  @negative
  Scenario: No results for unmatched filters
    Given the user has items in the system
    When the user filters items by status "inactive"
    And the user filters items by search term "nonexistent"
    Then no items are shown
    And the user sees a clear empty state message

  @regression
  Scenario Outline: Sort filtered items
    Given the user has items with varying statuses and titles
    When the user filters items by status "<status>"
    And the user sorts the results by "<sort_order>"
    Then the items are ordered by "<sort_order>"

    Examples:
      | status  | sort_order      |
      | active  | title ascending |
      | active  | title descending|
      | inactive| status ascending|
