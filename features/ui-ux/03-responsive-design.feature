@ui-ux @responsive @mobile
Feature: Responsive Design
  As a user on different devices
  I want the application to work well on any screen size
  So that I can use it on desktop, tablet, or mobile

  @positive
  Scenario: Layout adjusts for mobile devices
    When the user accesses the application on mobile device
    And the screen width is 375px
    Then the layout adapts to mobile view
    And content is displayed in single column
    And all features remain accessible

  @positive
  Scenario: Navigation menu collapses on small screens
    Given the screen width is less than 768px
    When the navigation is rendered
    Then the menu collapses into hamburger icon
    And clicking icon reveals navigation menu
    And menu overlays or slides in from side
    And all menu items are accessible

  @positive
  Scenario: Tables scroll horizontally on small screens
    Given a table with many columns
    When viewed on mobile device
    Then the table is scrollable horizontally
    And important columns remain visible
    And scroll indicator shows more content available
    And data remains readable

  @positive
  Scenario: Forms remain usable on mobile devices
    When the user completes a form on mobile
    Then form fields are appropriately sized
    And touch targets are at least 44x44 pixels
    And keyboard type matches input (email, number, etc.)
    And form is easy to complete on touchscreen

  @positive
  Scenario: Text remains readable on small screens
    When the application is viewed on mobile
    Then font sizes are legible (minimum 16px for body)
    And line spacing is appropriate
    And text doesn't overflow containers
    And readability is maintained

  @positive
  Scenario: Images and media are responsive
    Given the page contains images
    When viewed on different screen sizes
    Then images scale appropriately
    And maintain aspect ratio
    And don't cause horizontal scrolling
    And load appropriately sized versions

  @positive
  Scenario: Touch targets are appropriately sized
    When interactive elements are displayed on mobile
    Then buttons are minimum 44x44 pixels
    And links have adequate spacing
    And touch targets don't overlap
    And accidental taps are minimized

  @positive
  Scenario: Modal dialogs work on mobile devices
    When a modal dialog appears on mobile
    Then the modal fits the screen
    And is scrollable if content is long
    And close button is easily accessible
    And backdrop prevents interaction with page

  @positive
  Scenario: Breakpoints provide optimal layouts
    When the application is viewed at different widths
    Then appropriate breakpoints are used:
      | width     | layout   |
      | < 576px   | mobile   |
      | 576-768px | tablet   |
      | 768-992px | tablet   |
      | > 992px   | desktop  |
    And content reflows smoothly at each breakpoint

  @positive
  Scenario: No horizontal scrolling on mobile
    When the user views any page on mobile
    Then content fits within viewport width
    And no horizontal scrollbar appears
    And all content is accessible without horizontal scrolling

  @positive
  Scenario: Cards stack vertically on mobile
    Given the page displays cards in grid layout
    When viewed on mobile device
    Then cards stack in single column
    And each card remains fully functional
    And spacing between cards is appropriate

  @positive
  Scenario: Search and filter controls adapt to mobile
    Given the page has search and filter options
    When viewed on mobile device
    Then controls are thumb-friendly
    And dropdowns work well with touch
    And filters can expand/collapse to save space
    And functionality is not compromised

  @accessibility
  Scenario: Mobile viewport meta tag is configured
    When the application HTML is rendered
    Then viewport meta tag is present
    And sets appropriate width and scale
    And prevents unwanted zooming
    And enables responsive design

  @positive
  Scenario: Landscape orientation is supported
    When mobile device is rotated to landscape
    Then the layout adapts appropriately
    And content remains usable
    And navigation is still accessible
    And no critical UI is hidden

  @positive
  Scenario: Loading indicators scale appropriately
    When content is loading
    Then loading spinners are visible at all sizes
    And scale appropriately for screen size
    And don't block important content
    And provide clear feedback

  @performance
  Scenario: Mobile version loads efficiently
    When the application is accessed on mobile
    Then only necessary resources are loaded
    And images are optimized for mobile
    And page load time is acceptable
    And data usage is reasonable

  @positive
  Scenario: Print layout is optimized
    When the user prints a page
    Then the layout adapts for print
    And navigation is hidden
    And content is formatted appropriately
    And page breaks are logical

  @positive
  Scenario: Tooltips work on touch devices
    Given tooltips provide additional information
    When accessed on touch device
    Then tooltips are triggered by tap
    And can be dismissed easily
    And don't interfere with other interactions

  @positive
  Scenario: Dropdown menus work on mobile
    When dropdown menus are used on mobile
    Then menus open reliably on touch
    And menu items are easy to select
    And menus close when expected
    And don't cause accidental selections

  @positive
  Scenario: Content priority is maintained on mobile
    When page is viewed on mobile
    Then most important content appears first
    And less critical content is accessible via scrolling
    And information hierarchy is preserved
    And user can quickly find what they need
