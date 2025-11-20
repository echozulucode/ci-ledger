# Test Suite

This directory contains all tests for the FastAPI Demo application.

## Directory Structure

```
tests/
├── api/                    # API integration tests
│   ├── test-api-keys-debug.js
│   ├── test-api-keys-flow.js
│   ├── test-items-api.js
│   ├── test-pat-api.js
│   └── test-tokens.js
├── e2e/                    # End-to-end UI tests (Puppeteer)
│   ├── test-admin-users.js
│   ├── test-console-check.js
│   ├── test-deployment.js
│   ├── test-final-check.js
│   ├── test-items-ui.js
│   └── test-ui.js
└── integration/            # Integration tests (reserved)
```

## Prerequisites

- Node.js and npm installed
- Application running (either locally or via Docker/Podman)
- Puppeteer installed: `npm install puppeteer`

## Running Tests

### API Tests

Test API endpoints with authentication:

```bash
# Test API keys functionality
node tests/api/test-api-keys-flow.js

# Test Personal Access Tokens
node tests/api/test-pat-api.js

# Test items CRUD operations
node tests/api/test-items-api.js

# Test token management
node tests/api/test-tokens.js
```

### E2E Tests

Test the full application flow with UI:

```bash
# Test basic UI login and navigation
node tests/e2e/test-ui.js

# Test items management UI
node tests/e2e/test-items-ui.js

# Test admin users page
node tests/e2e/test-admin-users.js

# Test deployment verification
node tests/e2e/test-deployment.js

# Complete system check
node tests/e2e/test-final-check.js
```

## Testing with HTTPie

### Using API Keys

```bash
# Set your API key
$API_KEY = "your-api-key-here"

# GET request
http GET http://localhost:8000/api/items "X-API-Key:$API_KEY"

# POST request
http POST http://localhost:8000/api/items "X-API-Key:$API_KEY" title="Test Item" description="A test item"

# PUT request
http PUT http://localhost:8000/api/items/1 "X-API-Key:$API_KEY" title="Updated Item" description="Updated description"

# DELETE request
http DELETE http://localhost:8000/api/items/1 "X-API-Key:$API_KEY"
```

### Using Personal Access Tokens (PAT)

```bash
# Set your PAT
$PAT = "your-pat-token-here"

# GET request
http GET http://localhost:8000/api/items "Authorization:Bearer $PAT"

# POST request
http POST http://localhost:8000/api/items "Authorization:Bearer $PAT" title="Test Item" description="A test item"
```

## Test Data

- **Default Admin Credentials**:
  - Email: `admin@example.com`
  - Password: `changethis`

## Notes

- E2E tests use Puppeteer and will launch a browser window
- Screenshots are saved to the `work/` directory (gitignored)
- Tests assume the application is running on `localhost:3000` (frontend) and `localhost:8000` (backend)
- For Docker/Podman deployments, tests will automatically detect the correct ports
