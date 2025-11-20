# BDD Feature Documentation

This directory contains Behavior-Driven Development (BDD) feature files written in Gherkin format. These files serve as living documentation that describes the application's behavior from a user's perspective.

## Purpose

- **Living Documentation**: Human-readable specifications that stay in sync with the code
- **Communication**: Bridge between technical and non-technical stakeholders
- **Test Automation**: Foundation for automated acceptance tests
- **Requirements Traceability**: Clear mapping between features and implementation

## Directory Structure

```
features/
├── authentication/          # User authentication and session management
├── user-management/         # User profile and admin operations
├── personal-access-tokens/  # API key management and authentication
├── items-management/        # Sample CRUD operations
├── security/               # Security controls and compliance
├── ui-ux/                  # User interface and experience
└── system-admin/           # System administration features
```

## Feature File Format

Each feature file follows this structure:

```gherkin
@tag1 @tag2
Feature: Feature Name
  As a [role]
  I want to [action]
  So that [benefit]

  Background:
    Given [common precondition]

  Scenario: Scenario description
    Given [precondition]
    When [action]
    Then [expected outcome]
    And [additional verification]
```

## Key Principles

1. **User-Centric**: Describe behavior from the user's perspective
2. **Declarative**: Focus on *what*, not *how*
3. **Concise**: Keep scenarios focused (3-5 steps each)
4. **One Behavior**: Each scenario tests exactly one business rule
5. **No Implementation Details**: Avoid mentioning UI elements or technical specifics

## Tags

Features and scenarios are tagged for organization and selective execution:

- `@authentication` - Authentication-related features
- `@authorization` - Access control features
- `@crud` - CRUD operations
- `@security` - Security features
- `@ui` - User interface features
- `@api` - API-specific scenarios
- `@admin` - Admin-only features
- `@smoke` - Critical path scenarios
- `@positive` - Happy path scenarios
- `@negative` - Error and edge cases

## Reading the Features

Start with these core features to understand the application:

1. `authentication/02-user-login.feature` - How users authenticate
2. `user-management/01-profile-management.feature` - Basic user operations
3. `personal-access-tokens/01-token-creation.feature` - API key management
4. `items-management/01-item-crud.feature` - Sample data operations

## Using with Test Automation

### Backend Testing (Python + pytest-bdd)

```bash
cd backend
pip install pytest-bdd
pytest tests/bdd/
```

### Frontend Testing (Playwright + Cucumber)

```bash
cd frontend
npm install --save-dev @cucumber/cucumber
npm run test:bdd
```

## Maintenance

- **Keep Current**: Update features when behavior changes
- **Review Regularly**: Include in code review process
- **Refactor**: Remove duplication, improve clarity
- **Tag Appropriately**: Maintain consistent tagging

## Style Guide

See `style-guide.md` for detailed writing conventions.

## Related Documentation

- Implementation Plan: `docs/ai/plan-001-implementation.md`
- BDD Documentation Plan: `docs/ai/plan-002-bdd-documentation.md`
- User Guide: `docs/USER_GUIDE.md`
- Admin Guide: `docs/ADMIN_GUIDE.md`
- API Guide: `docs/API_GUIDE.md`

## Contact

For questions about these features or to suggest improvements, please contact the development team.
